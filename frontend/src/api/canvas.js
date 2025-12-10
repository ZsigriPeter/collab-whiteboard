import api from './config';

export const canvasAPI = {
  getObjects: async (whiteboardId) => {
    try {
      console.log('🔄 Fetching objects for whiteboard:', whiteboardId);
      const response = await api.get(`/api/canvas/objects/?whiteboard=${whiteboardId}`);
      console.log('✅ Objects response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get objects error:', error.response?.data || error.message);
      throw error;
    }
  },

  createObject: async (objectData) => {
    try {
      console.log('🔄 Creating object:', objectData);
      const response = await api.post('/api/canvas/objects/', objectData);
      console.log('✅ Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create object error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateObject: async (id, objectData) => {
    try {
      console.log('🔄 Updating object:', id, objectData);
      const response = await api.patch(`/api/canvas/objects/${id}/`, objectData);
      console.log('✅ Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update object error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteObject: async (id) => {
    try {
      console.log('🔄 Deleting object:', id);
      await api.delete(`/api/canvas/objects/${id}/`);
      console.log('✅ Delete success');
    } catch (error) {
      console.error('❌ Delete object error:', error.response?.data || error.message);
      throw error;
    }
  },

  bulkCreate: async (whiteboardId, objects) => {
    try {
      const response = await api.post('/api/canvas/objects/bulk_create/', {
        whiteboard: whiteboardId,
        objects
      });
      return response.data;
    } catch (error) {
      console.error('❌ Bulk create error:', error.response?.data || error.message);
      throw error;
    }
  },

  bulkUpdate: async (updates) => {
    try {
      const response = await api.post('/api/canvas/objects/bulk_update/', { updates });
      return response.data;
    } catch (error) {
      console.error('❌ Bulk update error:', error.response?.data || error.message);
      throw error;
    }
  },

  lockObject: async (id) => {
    try {
      const response = await api.post(`/api/canvas/objects/${id}/lock/`);
      return response.data;
    } catch (error) {
      console.error('❌ Lock object error:', error.response?.data || error.message);
      throw error;
    }
  },

  unlockObject: async (id) => {
    try {
      const response = await api.post(`/api/canvas/objects/${id}/unlock/`);
      return response.data;
    } catch (error) {
      console.error('❌ Unlock object error:', error.response?.data || error.message);
      throw error;
    }
  },
};