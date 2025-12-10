import { create } from 'zustand';
import { canvasAPI } from '../api/canvas';

export const useCanvasStore = create((set, get) => ({
  objects: [],
  selectedTool: 'select',
  selectedColor: '#000000',
  strokeWidth: 2,
  selectedObjectId: null,
  isDrawing: false,
  currentDrawing: null,
  isLoading: false,
  error: null,

  setTool: (tool) => set({ selectedTool: tool }),
  setColor: (color) => set({ selectedColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  selectObject: (id) => set({ selectedObjectId: id }),
  deselectObject: () => set({ selectedObjectId: null }),

  loadObjects: async (whiteboardId) => {
    set({ isLoading: true, error: null });
    try {
      const objects = await canvasAPI.getObjects(whiteboardId);
      set({ objects, isLoading: false });
      console.log('✅ Loaded objects:', objects);
    } catch (error) {
      console.error('❌ Failed to load objects:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  addObject: async (whiteboardId, objectData) => {
    try {
      const newObject = await canvasAPI.createObject({
        whiteboard: whiteboardId,
        ...objectData
      });
      set((state) => ({ objects: [...state.objects, newObject] }));
      console.log('✅ Created object:', newObject);
      return newObject;
    } catch (error) {
      console.error('❌ Failed to create object:', error);
      throw error;
    }
  },

  updateObject: async (id, updates) => {
    try {
      await canvasAPI.updateObject(id, updates);
      set((state) => ({
        objects: state.objects.map((obj) =>
          obj.id === id ? { ...obj, ...updates } : obj
        ),
      }));
      console.log('✅ Updated object:', id, updates);
    } catch (error) {
      console.error('❌ Failed to update object:', error);
    }
  },

  deleteObject: async (id) => {
    try {
      await canvasAPI.deleteObject(id);
      set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
        selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
      }));
      console.log('✅ Deleted object:', id);
    } catch (error) {
      console.error('❌ Failed to delete object:', error);
    }
  },

  startDrawing: (point) => {
    set({ isDrawing: true, currentDrawing: [point] });
  },

  continueDrawing: (point) => {
    const { currentDrawing } = get();
    if (currentDrawing) {
      set({ currentDrawing: [...currentDrawing, point] });
    }
  },

  endDrawing: () => {
    set({ isDrawing: false, currentDrawing: null });
  },

  clearObjects: () => set({ objects: [] }),
}));