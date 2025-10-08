import { IconBrandChrome, IconHelp } from '@tabler/icons-react'
import type { MenuItem } from '@/types'

// Icon mapping for type safety
const icons = {
  IconBrandChrome,
  IconHelp,
} as const

/**
 * Other menu items configuration
 */
export const other: MenuItem = {
  id: 'sample-docs-roadmap',
  title: 'Sample Page & Documentation',
  type: 'group', 
  children: [
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.IconBrandChrome,
      breadcrumbs: false,
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: 'https://codedthemes.gitbook.io/berry/',
      icon: icons.IconHelp,
      external: true,
      target: true,
    },
  ],
}

