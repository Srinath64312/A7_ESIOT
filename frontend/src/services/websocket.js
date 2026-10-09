class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/telemetry';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
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
      this.attemptReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error', err);
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 2000 * Math.pow(2, this.reconnectAttempts - 1));
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ type: 'CONNECTION_STATE', payload: this.isConnected });
    return () => this.listeners.delete(listener);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();
