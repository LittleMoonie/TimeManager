export * from './theme'

/**
 * Common utility types
 */
export interface MenuItem {
  id: string
  title: string
  type: 'item' | 'group' | 'collapse'
  url?: string
  icon?: React.ComponentType<any>
  children?: MenuItem[]
  external?: boolean
  target?: boolean
  breadcrumbs?: boolean
  disabled?: boolean
}

/**
 * Navigation configuration
 */
export interface MenuConfig {
  items: MenuItem[]
}

/**
 * Auth user interface
 */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'pending' | 'succeeded' | 'failed'

/**
 * Generic async thunk state
 */
export interface AsyncState<T = any> {
  data: T | null
  status: LoadingState
  error: string | null
}
