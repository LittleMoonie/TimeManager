import { IconDashboard, IconDeviceAnalytics } from '@tabler/icons-react'
import type { MenuItem } from '@/types'

// Icon mapping for type safety
const icons = {
  IconDashboard,
  IconDeviceAnalytics,
} as const

/**
 * Dashboard menu items configuration
 */
export const dashboard: MenuItem = {
  id: 'dashboard',
  title: 'Dashboard', 
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
    },
  ],
}
