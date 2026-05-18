import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserType = 'staff' | 'customer';
export type StaffRole = 'ADMIN' | 'ATTENDANT';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  type: UserType;
  role?: StaffRole;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken,

      isAdmin: () => get().user?.role === 'ADMIN',

      isStaff: () => get().user?.type === 'staff',
    }),
    {
      name: 'mob-burger:auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
