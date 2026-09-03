import apiClient from './apiClient.js';

export const productService = {
  async getProducts(params = {}) {
    return apiClient.get('/products', { params });
  },

  async getProductById(id) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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