import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Business API
export const businessAPI = {
  getAll: (search) => api.get('/api/business', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/api/business/${id}`),
  create: (data) => api.post('/api/business', data),
  update: (id, data) => api.put(`/api/business/${id}`, data),
  delete: (id) => api.delete(`/api/business/${id}`),
};

// Content API
export const contentAPI = {
  getByBusiness: (businessId, promptType = null) => {
    const params = promptType ? { prompt_type: promptType } : {};
    return api.get(`/api/content/business/${businessId}`, { params });
  },
  getById: (id) => api.get(`/api/content/${id}`),
  create: (data) => api.post('/api/content', data),
  update: (id, data) => api.put(`/api/content/${id}`, data),
  delete: (id) => api.delete(`/api/content/${id}`),
};

// Prompts API
export const promptsAPI = {
  execute: (data) => api.post('/api/prompts/execute', data),
  getTypes: () => api.get('/api/prompts/types'),
  getProgress: (businessId) => api.get(`/api/prompts/progress/${businessId}`),
  updateProgress: (progressId, data) => api.put(`/api/prompts/progress/${progressId}`, data),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard'),
};

export default api;
