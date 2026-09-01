import apiClient from './apiClient.js';

export const productService = {
  async getProducts(params = {}) {
    return apiClient.get('/products', { params });
  },

  async getProductById(id) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(data) {
    const res = await apiClient.post('/products', data);
    return res.data;
  },

  async updateProduct(id, data) {
    const res = await apiClient.put(`/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id) {
    return apiClient.delete(`/products/${id}`);
  },
};