import type { CustomizationState } from '@/types/theme'

/**
 * Root state interface
 */
export interface RootState {
  customization: CustomizationState
}

/**
 * Re-export store types for convenience
 */
export type { AppDispatch } from './index'

