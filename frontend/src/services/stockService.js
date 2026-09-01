import apiClient from './apiClient.js';

export const stockService = {
  async getMovements(params = {}) {
    return apiClient.get('/stock/movements', { params });
  },

  async recordMovement(data) {
    const res = await apiClient.post('/stock/movements', data);
    return res.data;
  },
};