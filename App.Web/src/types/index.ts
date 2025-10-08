import type { ComponentType } from 'react';

export * from './domain';
export * from './theme';

export interface MenuItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapse';
  url?: string;
  icon?: ComponentType<any>;
  children?: MenuItem[];
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  disabled?: boolean;
}

export interface MenuConfig {
  items: MenuItem[];
}

export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface AsyncState<T = unknown> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}
