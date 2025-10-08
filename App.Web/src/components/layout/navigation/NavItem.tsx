import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import {
  Avatar,
  Chip,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  ListItemButton
} from '@mui/material'

// Project imports
import { menuOpen, setMenu } from '@/lib/store/slices/customizationSlice'
import type { RootState } from '@/lib/store/types'
import type { MenuItem } from '@/types'

// Assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

interface NavItemProps {
  item: MenuItem
  level: number
}

/**
 * Navigation Item Component
 * Converted from layout/MainLayout/Sidebar/MenuList/NavItem/index.js
 */
function NavItem({ item, level }: NavItemProps) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const location = useLocation()
  const customization = useSelector((state: RootState) => state.customization)
  const matchesSM = useMediaQuery(theme.breakpoints.down('md'))

  const Icon = item.icon
  const itemIcon = item.icon ? (
    <Icon stroke={1.5} size="1.3rem" />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: customization.isOpen.findIndex((id) => id === item.id) > -1 ? '8px' : '6px',
        height: customization.isOpen.findIndex((id) => id === item.id) > -1 ? '8px' : '6px',
      }}
      fontSize={level > 0 ? 'inherit' : 'default'}
    />
  )

  const itemTarget = item.target ? '_blank' : undefined

  // Handle internal/external links
  const listItemProps = item.external
    ? { component: 'a', href: item.url }
    : { component: Link, to: item.url || '#' }

  const itemHandler = (id: string) => {
    dispatch(menuOpen(id))
    if (matchesSM) {
      dispatch(setMenu(false))
    }
  }

  // Set active menu item on page load
  useEffect(() => {
    const currentPath = location.pathname
    if (item.url && currentPath.includes(item.id)) {
      dispatch(menuOpen(item.id))
    }
  }, [dispatch, item.id, item.url, location.pathname])

  const isSelected = customization.isOpen.findIndex((id) => id === item.id) > -1

  return (
    <ListItemButton
      {...listItemProps}
      disabled={item.disabled}
      sx={{
        borderRadius: `${customization.borderRadius}px`,
        mb: 0.5,
        alignItems: level > 1 ? 'flex-start' : 'center',
        backgroundColor: level > 1 ? 'transparent !important' : undefined,
        py: level > 1 ? 1 : 1.25,
        pl: `${level * 24 + 16}px`,
      }}
      selected={isSelected}
      onClick={() => itemHandler(item.id)}
      target={itemTarget}
    >
      <ListItemIcon
        sx={{
          my: 'auto',
          minWidth: !item.icon ? 18 : 36,
        }}
      >
        {itemIcon}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Typography
            variant={isSelected ? 'h5' : 'body1'}
            color="inherit"
          >
            {item.title}
          </Typography>
        }
        secondary={
          item.caption && (
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
          )
        }
      />
      
      {item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar ? <Avatar>{item.chip.avatar}</Avatar> : undefined}
        />
      )}
    </ListItemButton>
  )
}

export default NavItem

