import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/client';
import { createApiClient } from '../api/client';

export interface Profile {
  id?: number;
  user_id?: number;
  email?: string;
  ai_credits: number;
  is_premium: boolean;
  is_admin: boolean;
}

interface UserState {
  profile: Profile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  /** Load the profile for the signed-in user (credits, plan). */
  fetchProfile: () => Promise<void>;
  /** Optimistically spend one credit locally; follow with `fetchProfile` to sync the truth. */
  decrementCredit: () => void;
  setPremiumStatus: (status: boolean) => void;
  signOut: () => Promise<void>;
}

const authApi = createApiClient('/api/auth');

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  firebaseUser: null,
  isLoading: true, // Start loading until Firebase Auth has reported its initial state
  error: null,

  fetchProfile: async () => {
    try {
      const response = await authApi.get('/profile/');
      set({ profile: response.data, error: null });
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      set({ error: 'Failed to load your profile.' });
    }
  },

  decrementCredit: () =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, ai_credits: Math.max(0, state.profile.ai_credits - 1) }
        : null,
    })),

  setPremiumStatus: (status: boolean) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, is_premium: status } : null,
    })),

  signOut: async () => {
    try {
      await auth.signOut();
      set({ profile: null, firebaseUser: null, error: null });
    } catch (error: unknown) {
      console.error('Sign out failed', error);
      set({ error: 'Failed to sign out.' });
    }
  },
}));

// Keep the store in sync with Firebase Auth.
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      useUserStore.setState({ firebaseUser: user, isLoading: false });
      await useUserStore.getState().fetchProfile();
    } else {
      useUserStore.setState({ firebaseUser: null, profile: null, isLoading: false });
    }
  });
}
