import api from './config';

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login/', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/profile/', userData);
    return response.data;
  },
};