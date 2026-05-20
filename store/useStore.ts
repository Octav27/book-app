import { create } from 'zustand';

interface User {
  name: string;
  username: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isOffline: boolean;
  setOfflineStatus: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
  isOffline: false,
  setOfflineStatus: (status) => set({ isOffline: status }),
}));
