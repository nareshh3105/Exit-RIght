import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '@/types';
import { signIn, signOut, signUp, getProfile } from '@/lib/api/auth';

interface AuthState {
  profile:     Profile | null;
  isLoading:   boolean;
  error:       string | null;

  login:       (email: string, password: string) => Promise<boolean>;
  register:    (email: string, password: string, fullName: string, homeStation: string) => Promise<boolean>;
  logout:      () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  clearError:  () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile:   null,
      isLoading: false,
      error:     null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        const { data, error } = await signIn(email, password);
        if (error || !data) {
          set({ isLoading: false, error: error ?? 'Login failed' });
          return false;
        }
        // Load full profile after login
        const { data: profile } = await getProfile(data.userId);
        set({ profile, isLoading: false });
        return true;
      },

      register: async (email, password, fullName, homeStation) => {
        set({ isLoading: true, error: null });
        const { data, error } = await signUp(email, password, fullName, homeStation);
        if (error || !data) {
          set({ isLoading: false, error: error ?? 'Registration failed' });
          return false;
        }
        set({ profile: data, isLoading: false });
        return true;
      },

      logout: async () => {
        await signOut();
        set({ profile: null, error: null });
      },

      loadProfile: async (userId) => {
        const { data } = await getProfile(userId);
        if (data) set({ profile: data });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'er-auth',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
