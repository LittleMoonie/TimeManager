import { Divider, List, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Project imports
import NavItem from './NavItem'
import NavCollapse from './NavCollapse'
import type { MenuItem } from '@/types'

interface NavGroupProps {
  item: MenuItem
}

/**
 * Navigation Group Component
 * Converted from layout/MainLayout/Sidebar/MenuList/NavGroup/index.js
 */
function NavGroup({ item }: NavGroupProps) {
  const theme = useTheme()

  // Render menu list collapse & items
  const items = item.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} />
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        )
    }
  })

  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography
              variant="caption"
              sx={{
                ...theme.typography.menuCaption,
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: theme.palette.grey[600],
              }}
              display="block"
              gutterBottom
            >
              {item.title}
              {item.caption && (
                <Typography
                  variant="caption"
                  sx={{
                    ...theme.typography.caption,
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: theme.palette.grey[600],
                  }}
                  display="block"
                  gutterBottom
                >
                  {item.caption}
                </Typography>
              )}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {/* Group divider */}
      <Divider sx={{ mt: 0.25, mb: 1.25 }} />
    </>
  )
}

export default NavGroup

