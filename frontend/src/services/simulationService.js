import { api } from './api';

export const simulationService = {
  getStatus: () => api.get('/api/simulation/status'),
  start: (scenario, motorId, intervalMs, tempOffset = 0, vibOffset = 0) =>
    api.post('/api/simulation/start', {
      scenario,
      motor_id: motorId,
      interval_ms: intervalMs,
      temp_offset: parseFloat(tempOffset) || 0,
      vib_offset: parseFloat(vibOffset) || 0
    }),
  stop: () => api.post('/api/simulation/stop', {}),
  updateConfig: (config) => api.post('/api/simulation/config', config)
};
