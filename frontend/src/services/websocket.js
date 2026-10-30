import { generateDemoTick, DEMO_MOTORS } from './demoMode';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 4;
    this.isConnected = false;

    // Demo mode state
    this.demoMode = false;
    this.demoInterval = null;
    this.demoScenario = 'NORMAL';
    this.demoMotorId = 1;
    this.demoTempOffset = 0;
    this.demoVibOffset = 0;
    this.demoRunning = false;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/telemetry';
    
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (e) {
      this._startDemoMode();
      return;
    }

    this.ws.onopen = () => {
      console.log('WebSocket connected to backend');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this._stopDemoMode();
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
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.notifyListeners({ type: 'CONNECTION_STATE', payload: false });
      this._scheduleReconnect();
    };

    this.ws.onerror = () => {
      // Will trigger onclose; demo mode starts after maxReconnectAttempts
    };
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.warn('Backend unreachable — switching to Demo Mode');
      this._startDemoMode();
    }
  }

  // ── Demo Mode ─────────────────────────────────────────────────────────────

  _startDemoMode() {
    if (this.demoMode) return;
    this.demoMode = true;
    this.isConnected = false;
    this.notifyListeners({ type: 'CONNECTION_STATE', payload: false });
    this.notifyListeners({ type: 'DEMO_MODE', payload: true });
    console.log('%c🤖 DEMO MODE ACTIVE — No backend required', 'color: #38bdf8; font-weight: bold');
  }

  _stopDemoMode() {
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
            id: Date.now(), motor_id: motorId, motor_name: `MTR-00${motorId}`,
            severity: prediction.severity, condition: prediction.predicted_condition,
            message: prediction.recommendation, timestamp: new Date().toISOString(), acknowledged: false
          }
        });
      }
    };

    tick(); // immediate first tick
    this.demoInterval = setInterval(tick, intervalMs);
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
    listener({ type: 'CONNECTION_STATE', payload: this.isConnected });
    if (this.demoMode) listener({ type: 'DEMO_MODE', payload: true });
    return () => this.listeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }

  disconnect() {
    this._stopDemoMode();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();
