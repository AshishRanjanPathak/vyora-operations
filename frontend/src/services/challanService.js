import apiClient from './apiClient.js';

export const challanService = {
  async getChallans(params = {}) {
    return apiClient.get('/challans', { params });
  },

  async getChallanById(id) {
    const res = await apiClient.get(`/challans/${id}`);
    return res.data;
  },

  async createDraftChallan(data) {
    const res = await apiClient.post('/challans', data);
    return res.data;
  },

  async confirmChallan(id) {
    const res = await apiClient.post(`/challans/${id}/confirm`);
    return res.data;
  },

  async cancelChallan(id) {
    const res = await apiClient.post(`/challans/${id}/cancel`);
    return res.data;
  },
};