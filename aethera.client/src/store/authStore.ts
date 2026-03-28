import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthUser } from '../api/auth';

type AuthState = {
  token: string | null;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  setAuthSession: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  _setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      isAuthenticated: false,
      isHydrated: false,
      setToken: (token) =>
        set({
          token,
          isAuthenticated: false,
        }),
      setCurrentUser: (currentUser) =>
        set((state) => ({
          currentUser,
          isAuthenticated: Boolean(state.token && currentUser),
        })),
      setAuthSession: (token, currentUser) =>
        set({
          token,
          currentUser,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          token: null,
          currentUser: null,
          isAuthenticated: false,
        }),
      _setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'aethera-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    }
  )
);

// Fallback: localStorage is synchronous, so onRehydrateStorage fires
// inside create() before useAuthStore is assigned. This line runs after
// assignment and guarantees isHydrated is true before any component renders.
useAuthStore.setState({ isHydrated: true });
