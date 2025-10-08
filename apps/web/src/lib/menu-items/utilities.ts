import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons-react'
import type { MenuItem } from '@/types'

// Icon mapping for type safety
const icons = {
  IconTypography,
  IconPalette, 
  IconShadow,
  IconWindmill,
} as const

/**
 * Utilities menu items configuration
 */
export const utilities: MenuItem = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-typography',
      title: 'Typography',
      type: 'item',
      url: '/utils/typography',
      icon: icons.IconTypography,
      breadcrumbs: false,
    },
    {
      id: 'util-color',
      title: 'Color',
      type: 'item',
      url: '/utils/color',
      icon: icons.IconPalette,
      breadcrumbs: false,
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      type: 'item', 
      url: '/utils/shadow',
      icon: icons.IconShadow,
      breadcrumbs: false,
    },
    {
      id: 'icons',
      title: 'Icons',
      type: 'collapse',
      icon: icons.IconWindmill,
      children: [
        {
          id: 'tabler-icons',
          title: 'Tabler Icons',
          type: 'item',
          url: '/icons/tabler-icons',
          breadcrumbs: false,
        },
        {
          id: 'material-icons', 
          title: 'Material Icons',
          type: 'item',
          url: '/icons/material-icons',
          breadcrumbs: false,
        },
      ],
    },
  ],
}

