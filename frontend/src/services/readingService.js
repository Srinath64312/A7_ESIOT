import { api } from './api';

export const readingService = {
  getReadings: async (motorId, limit = 100) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/readings?limit=${limit}`);
      return Array.isArray(res) ? res : (res?.items || []);
    } catch (e) {
      return [];
    }
  },
  create: (data) => api.post(`/api/readings`, data)
};
