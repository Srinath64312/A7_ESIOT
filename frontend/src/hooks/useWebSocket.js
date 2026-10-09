import { useState, useEffect, useCallback } from 'react';
import { wsManager } from '../services/websocket';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(wsManager.isConnected);
  const [telemetry, setTelemetry] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [mode, setMode] = useState('HARDWARE');

  useEffect(() => {
    wsManager.connect();

    const handleMessage = (data) => {
      if (data.type === 'CONNECTION_STATE') {
        setIsConnected(data.payload);
      } else if (data.type === 'telemetry') {
        setTelemetry(prev => ({ ...prev, [data.data.motor_id]: data.data }));
      } else if (data.type === 'prediction') {
        setPredictions(prev => ({ ...prev, [data.data.motor_id]: data.data }));
      } else if (data.type === 'alert') {
        setAlerts(prev => [data.data, ...prev].slice(0, 50));
      } else if (data.type === 'simulation_status') {
        setMode(data.data.is_running ? 'SIMULATION' : 'HARDWARE');
      }
    };

    const unsubscribe = wsManager.subscribe(handleMessage);
    return () => unsubscribe();
  }, []);

  return { isConnected, telemetry, alerts, predictions, mode };
}
