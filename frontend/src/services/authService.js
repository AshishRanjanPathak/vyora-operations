import apiClient from './apiClient.js';

export const authService = {
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  async register(data) {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },
};