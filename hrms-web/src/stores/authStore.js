// stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  webSetting: {
    leftSideBarBackgroundColor: `linear-gradient(90deg, rgb(127, 191, 42), rgb(40, 24, 112), rgb(40, 24, 112))`,
    leftSideBarTextColor: "white",
    iconColor: "white",
    buttonColor:` linear-gradient(90deg, rgb(127, 191, 42), rgb(40, 24, 112), rgb(40, 24, 112))`,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Synchronous actions
  loginSuccess: (userData) =>
    set({
      user: userData,
      isAuthenticated: true,
      error: null,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
