import { api } from './api';
import { generateHistoricalReadings } from './demoMode';

export const readingService = {
  getReadings: async (motorId = 1, limit = 100) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/readings?limit=${limit}`);
      const list = Array.isArray(res) ? res : (res?.items || []);
      if (list.length > 0) return list;
      return generateHistoricalReadings(limit, motorId);
    } catch (e) {
      return generateHistoricalReadings(limit, motorId);
    }
  },
  create: (data) => api.post(`/api/readings`, data)
};
