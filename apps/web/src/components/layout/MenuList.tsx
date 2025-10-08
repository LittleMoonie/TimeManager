import { Typography } from '@mui/material'

// Project imports
import NavGroup from './navigation/NavGroup'
import menuItems from '@/lib/menu-items'
import type { MenuItem } from '@/types'

/**
 * Menu List Component
 * Converted from layout/MainLayout/Sidebar/MenuList/index.js
 */
function MenuList() {
  const navItems = menuItems.items.map((item: MenuItem) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        )
    }
  })

  return <>{navItems}</>
}

export default MenuList
