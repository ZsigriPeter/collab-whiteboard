import { create } from 'zustand';
import { boardsAPI } from '../api/boards';

export const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null,
  objects: [],
  history: [],
  future: [],
  isLoading: false,
  error: null,

  fetchBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await boardsAPI.getAll();
      set({ 
        boards: Array.isArray(response) ? response : response?.data || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      set({ 
        boards: [], 
        isLoading: false,
        error: 'Failed to load boards'
      });
    }
  },

  fetchBoard: async (id) => {
    set({ isLoading: true });
    try {
      const board = await boardsAPI.getById(id);

      let objects = board.canvas_objects || [];

      objects = objects.map(obj => ({
        ...obj,
        ...(obj.data || {}),
        points: Array.isArray(obj.data?.points) ? obj.data.points : [],
        text: obj.data?.text || "",
        radius: obj.data?.radius || obj.radius || 0,
      }));

      set({
        currentBoard: board,
        objects,
        history: [],
        future: [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },


  addObject: (obj) => {
    const { objects, history } = get();
    set({
      history: [...history, objects],
      objects: [...objects, obj],
      future: [],
    });
  },

  updateObject: (id, attrs) => {
    const { objects, history } = get();
    set({
      history: [...history, objects],
      objects: objects.map((o) =>
        o.id === id ? { ...o, ...attrs } : o
      ),
      future: [],
    });
  },

  saveObjects: async (boardId, objects) => {
    const payload = objects.map(obj => ({
      ...obj,
      data: {
        points: obj.points,
        text: obj.text,
        radius: obj.radius,
      }
    }));

    await boardsAPI.update(boardId, { objects: payload });
  },


  undo: () => {
    const { history, future, objects } = get();
    if (history.length === 0) return;

    const prev = history[history.length - 1];

    set({
      objects: prev,
      history: history.slice(0, -1),
      future: [objects, ...future],
    });
  },

  redo: () => {
    const { history, future, objects } = get();
    if (future.length === 0) return;

    const next = future[0];

    set({
      objects: next,
      future: future.slice(1),
      history: [...history, objects],
    });
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,
}));
