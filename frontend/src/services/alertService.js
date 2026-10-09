import { api } from './api';

export const alertService = {
  getAll: async (skip = 0, limit = 100) => {
    try {
      const res = await api.get(`/api/alerts?skip=${skip}&limit=${limit}`);
      return Array.isArray(res) ? res : (res?.items || []);
    } catch (e) {
      return [];
    }
  },
  getForMotor: async (motorId) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/alerts`);
      return Array.isArray(res) ? res : (res?.items || []);
    } catch (e) {
      return [];
    }
  },
  resolve: (id, notes) => api.post(`/api/alerts/${id}/resolve`, { notes })
};
