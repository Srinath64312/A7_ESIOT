import { api } from './api';

export const simulationService = {
  getStatus: () => api.get('/api/simulation/status'),
  start: (scenario, motorId, intervalMs) => api.post('/api/simulation/start', { scenario, motor_id: motorId, interval_ms: intervalMs }),
  stop: () => api.post('/api/simulation/stop', {}),
  updateConfig: (config) => api.post('/api/simulation/config', config)
};
