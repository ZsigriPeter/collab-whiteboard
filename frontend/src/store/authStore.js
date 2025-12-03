import { create } from 'zustand';
import { authAPI } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.login(username, password);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authAPI.getProfile();
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
}));