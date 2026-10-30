import { generateDemoTick, DEMO_MOTORS } from './demoMode';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 2;
    this.isConnected = false;

    // Simulation engine state
    this.demoMode = false;
    this.demoInterval = null;
    this.demoScenario = 'NORMAL';
    this.demoMotorId = 1;
    this.demoTempOffset = 0;
    this.demoVibOffset = 0;
    this.demoRunning = true; // Auto-run so the digital twin is active on load!
  }

  connect() {
    // If running on a static host (like GitHub Pages or file:), try connecting briefly,
    // but default immediately to the client simulation engine so UI is never blank/frozen.
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const wsUrl = import.meta.env.VITE_WS_URL || (isHttps ? null : 'ws://localhost:8000/ws/telemetry');

    if (!wsUrl || this.ws?.readyState === WebSocket.OPEN) {
      this._startClientEngine();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);
    } catch (e) {
      this._startClientEngine();
      return;
    }

    this.ws.onopen = () => {
      console.log('Connected to backend WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this._stopClientEngine();
      this.notifyListeners({ type: 'CONNECTION_STATE', payload: true });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners(data);
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.notifyListeners({ type: 'CONNECTION_STATE', payload: false });
      this._scheduleReconnect();
    };

    this.ws.onerror = () => {
      this._startClientEngine();
    };
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 1500);
    } else {
      this._startClientEngine();
    }
  }

  // ── Client-Side AI Simulation Engine ──────────────────────────────────────

  _startClientEngine() {
    if (this.demoMode) return;
    this.demoMode = true;
    this.notifyListeners({ type: 'CONNECTION_STATE', payload: true });
    this.notifyListeners({ type: 'DEMO_MODE', payload: true });

    // Auto-stream telemetry so digital twin and charts are immediately alive
    this.startDemoSimulation('NORMAL', 1, 1000, 0, 0);
  }

  _stopClientEngine() {
    this.demoMode = false;
    this._stopDemoLoop();
    this.notifyListeners({ type: 'DEMO_MODE', payload: false });
  }

  startDemoSimulation(scenario = 'NORMAL', motorId = 1, intervalMs = 1000, tempOffset = 0, vibOffset = 0) {
    this.demoScenario = scenario;
    this.demoMotorId = motorId;
    this.demoTempOffset = tempOffset;
    this.demoVibOffset = vibOffset;
    this.demoRunning = true;
    this._stopDemoLoop();

    const tick = () => {
      if (!this.demoRunning) return;
      const { telemetry, prediction } = generateDemoTick(
        this.demoScenario, this.demoMotorId, this.demoTempOffset, this.demoVibOffset
      );
      this.notifyListeners({ type: 'telemetry', data: telemetry });
      this.notifyListeners({ type: 'prediction', data: prediction });

      if (prediction.severity === 'HIGH') {
        this.notifyListeners({
          type: 'alert',
          data: {
            id: Date.now(),
            motor_id: motorId,
            motor_name: `MTR-00${motorId}`,
            severity: prediction.severity,
            condition: prediction.predicted_condition,
            message: prediction.recommendation,
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        });
      }
    };

    tick();
    this.demoInterval = setInterval(tick, Math.max(200, intervalMs));
    this.notifyListeners({ type: 'simulation_status', data: { is_running: true, scenario } });
  }

  stopDemoSimulation() {
    this.demoRunning = false;
    this._stopDemoLoop();
    this.notifyListeners({ type: 'simulation_status', data: { is_running: false, scenario: null } });
  }

  _stopDemoLoop() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  getDemoStatus() {
    return {
      running: this.demoRunning,
      scenario: this.demoScenario,
      motor_id: this.demoMotorId,
      tick_count: 0,
      temp_offset: this.demoTempOffset,
      vib_offset: this.demoVibOffset
    };
  }

  isDemoMode() {
    return this.demoMode;
  }

  // ── Pub/Sub ────────────────────────────────────────────────────────────────

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ type: 'CONNECTION_STATE', payload: this.isConnected || this.demoMode });
    if (this.demoMode) listener({ type: 'DEMO_MODE', payload: true });
    return () => this.listeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }

  disconnect() {
    this._stopClientEngine();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();
