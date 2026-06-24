import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase/client';
import axios from 'axios';

export interface Profile {
  id?: number;
  user_id?: number;
  ai_credits: number;
  is_premium: boolean;
  is_admin: boolean;
}

interface UserState {
  profile: Profile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (token: string) => Promise<void>;
  decrementCredit: () => void;
  setPremiumStatus: (status: boolean) => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  firebaseUser: null,
  isLoading: true, // Start loading until Firebase Auth is initialized
  error: null,

  fetchProfile: async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/auth/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      set({ profile: response.data, error: null });
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      const errorWithMessage = err as { message?: string };
      set({ error: errorWithMessage.message || 'Failed to fetch profile', profile: null });
    }
  },

  decrementCredit: () => set((state) => ({
    profile: state.profile ? { 
      ...state.profile, 
      ai_credits: Math.max(0, state.profile.ai_credits - 1) 
    } : null
  })),

  setPremiumStatus: (status: boolean) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      is_premium: status
    } : null
  })),

  signOut: async () => {
    try {
      await auth.signOut();
      set({ profile: null, firebaseUser: null, error: null });
    } catch (error: unknown) {
      const errorWithMessage = error as { message?: string };
      set({ error: errorWithMessage.message || 'Failed to sign out' });
    }
  }
}));

// Set up Firebase Auth listener to sync state automatically
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      useUserStore.setState({ firebaseUser: user, isLoading: false });
      const token = await user.getIdToken();
      await useUserStore.getState().fetchProfile(token);
    } else {
      useUserStore.setState({ firebaseUser: null, profile: null, isLoading: false });
    }
  });
}
