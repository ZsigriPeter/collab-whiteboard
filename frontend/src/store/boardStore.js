import { create } from 'zustand';
import { boardsAPI } from '../api/boards';

export const useBoardStore = create((set) => ({
  boards: [],
  currentBoard: null,
  isLoading: false,

  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const boards = await boardsAPI.getAll();
      set({ boards, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchBoard: async (id) => {
    set({ isLoading: true });
    try {
      const board = await boardsAPI.getById(id);
      set({ currentBoard: board, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createBoard: async (boardData) => {
    const board = await boardsAPI.create(boardData);
    set((state) => ({ boards: [...state.boards, board] }));
    return board;
  },

  updateBoard: async (id, boardData) => {
    const board = await boardsAPI.update(id, boardData);
    set((state) => ({
      boards: state.boards.map((b) => (b.id === id ? board : b)),
      currentBoard: state.currentBoard?.id === id ? board : state.currentBoard,
    }));
  },

  deleteBoard: async (id) => {
    await boardsAPI.delete(id);
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    }));
  },
}));