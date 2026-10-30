import { api } from './api';
import { DEMO_ALERTS } from './demoMode';

export const alertService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const res = await api.get(`/api/alerts?skip=${skip}&limit=${limit}`);
      return Array.isArray(res) ? res : (res?.items || []);
    } catch (e) {
      return DEMO_ALERTS;
    }
  },
  getForMotor: async (motorId) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/alerts`);
      return Array.isArray(res) ? res : (res?.items || []);
    } catch (e) {
      return DEMO_ALERTS.filter(a => a.motor_id === parseInt(motorId));
    }
  },
  resolve: async (id, notes) => {
    try {
      return await api.post(`/api/alerts/${id}/resolve`, { notes });
    } catch (e) {
      return { id, acknowledged: true };
    }
  }
};
