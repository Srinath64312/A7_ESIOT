import { api } from './api';

export const aiService = {
  getPrediction: (motorId) => api.get(`/api/motors/${motorId}/prediction`),
  getHealth: (motorId) => api.get(`/api/motors/${motorId}/health`)
};
