import { api } from './api';

export const motorService = {
  getAll: () => api.get('/api/motors'),
  getById: (id) => api.get(`/api/motors/${id}`),
  create: (data) => api.post('/api/motors', data),
  update: (id, data) => api.put(`/api/motors/${id}`, data),
  delete: (id) => api.delete(`/api/motors/${id}`)
};
