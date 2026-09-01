import apiClient from './apiClient.js';

export const customerService = {
  async getCustomers(params = {}) {
    return apiClient.get('/customers', { params });
  },

  async getCustomerById(id) {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },

  async createCustomer(data) {
    const res = await apiClient.post('/customers', data);
    return res.data;
  },

  async updateCustomer(id, data) {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  },

  async deleteCustomer(id) {
    return apiClient.delete(`/customers/${id}`);
  },

  async addFollowUp(customerId, data) {
    const res = await apiClient.post(`/customers/${customerId}/followups`, data);
    return res.data;
  },
};