import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialState = {
  token: null,
  user: null,
  role: null,
  isAuthenticated: false,
  hasHydrated: false,
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      setAuth: ({ token, user, role }) =>
        set({
          token,
          user,
          role,
          isAuthenticated: Boolean(token),
        }),
      updateUser: (user) => set((state) => ({ user: { ...(state.user || {}), ...user } })),
      clearAuth: () => set({ ...initialState, hasHydrated: true }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "employee-engagement-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    },
  ),
);
