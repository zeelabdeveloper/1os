// stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  webSetting: {
    leftSideBarBackgroundColor: `linear-gradient(90deg, rgb(127, 191, 42), rgb(40, 24, 112), rgb(40, 24, 112))`,
    leftSideBarTextColor: "white",
    iconColor: "white",
    buttonColor: ` linear-gradient(90deg, rgb(127, 191, 42), rgb(40, 24, 112), rgb(40, 24, 112))`,
  },
  isAuthenticated: false,
  isLoading: false,
  error: null,
  EmployeeId: null,
  permissions: [],

  // Synchronous actions
  loginSuccess: (userData, permissions, EmployeeId) =>
    set({
      user: userData,
      isAuthenticated: true,
      error: null,
      EmployeeId: EmployeeId,
      permissions: permissions,
    }),

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });

    localStorage.clear();

    sessionStorage.clear();
   
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
