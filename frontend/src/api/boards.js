import api from './config';

export const boardsAPI = {
  getAll: async () => {
    const response = await api.get('/api/boards/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/boards/${id}/`);
    return response.data;
  },

  create: async (boardData) => {
    const response = await api.post('/api/boards/', boardData);
    return response.data;
  },

  update: async (id, boardData) => {
    const response = await api.put(`/api/boards/${id}/`, boardData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/api/boards/${id}/`);
  },
};