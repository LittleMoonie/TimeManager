import { dashboard } from './dashboard'
import { utilities } from './utilities' 
import { other } from './other'
import type { MenuConfig } from '@/types'

/**
 * Main menu configuration
 * Combines all menu item groups
 */
const menuItems: MenuConfig = {
  items: [dashboard, utilities, other],
}

export default menuItems
export { dashboard, utilities, other }

