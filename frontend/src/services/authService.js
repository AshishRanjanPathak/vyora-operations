import apiClient from './apiClient.js';

export const authService = {
  async login(credentials) {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data; // { user, token }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },
};