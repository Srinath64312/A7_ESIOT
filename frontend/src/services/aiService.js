import { api } from './api';
import { DEMO_AI_STATUS, generateDemoTick } from './demoMode';

export const aiService = {
  getStatus: async () => {
    try {
      const res = await api.get('/api/health');
      return res;
    } catch (e) {
      return DEMO_AI_STATUS;
    }
  },
  getPrediction: async (motorId = 1) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/prediction`);
      return res;
    } catch (e) {
      const { prediction } = generateDemoTick('NORMAL', motorId);
      return prediction;
    }
  },
  getHealth: async (motorId = 1) => {
    try {
      const res = await api.get(`/api/motors/${motorId}/health`);
      return res;
    } catch (e) {
      return { health_score: 94, status: 'HEALTHY' };
    }
  }
};
