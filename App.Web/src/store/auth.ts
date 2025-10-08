import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { dataSource } from '@/api/dataSource';
import { rolePermissions } from './permissions';
import type { PermissionKey, Role, User } from '@/types';

interface AuthState {
  currentUserId: string;
  currentUser: User;
  setUser: (userId: string) => void;
  signInAs: (role: Role) => void;
  can: (permission: PermissionKey) => boolean;
}

const pickUserById = (userId: string): User => {
  const user = dataSource.listUsers().find((item) => item.id === userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  return user;
};

const pickUserByRole = (role: Role): User => {
  const user = dataSource.listUsers().find((item) => item.role === role);
  if (!user) {
    throw new Error(`No user found with role ${role}`);
  }
  return user;
};

const defaultUser = pickUserByRole('CEO');

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUserId: defaultUser.id,
      currentUser: defaultUser,
      setUser: (userId) => {
        const user = pickUserById(userId);
        set({ currentUserId: userId, currentUser: user });
      },
      signInAs: (role) => {
        const user = pickUserByRole(role);
        set({ currentUserId: user.id, currentUser: user });
      },
      can: (permission) => {
        const { currentUser } = get();
        const permissions = rolePermissions[currentUser.role] ?? [];
        return permissions.includes(permission);
      },
    }),
    {
      name: 'portal-auth-store',
      partialize: (state) => ({ currentUserId: state.currentUserId }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const safeUser = dataSource.listUsers().find((user) => user.id === state.currentUserId) ?? defaultUser;
        state.currentUser = safeUser;
      },
    },
  ),
);

export const useAuth = () => useAuthStore((state) => state);
