import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/material/styles'
import {
  Collapse,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  ListItemButton
} from '@mui/material'

// Project imports
import NavItem from './NavItem'
import type { RootState } from '@/lib/store/types'
import type { MenuItem } from '@/types'

// Assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'

interface NavCollapseProps {
  menu: MenuItem
  level: number
}

/**
 * Navigation Collapse Component
 * Converted from layout/MainLayout/Sidebar/MenuList/NavCollapse/index.js
 */
function NavCollapse({ menu, level }: NavCollapseProps) {
  const theme = useTheme()
  const customization = useSelector((state: RootState) => state.customization)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const handleClick = () => {
    setOpen(!open)
    setSelected(!selected ? menu.id : null)
  }

  // Render menu collapse & item
  const menus = menu.children?.map((item) => {
    switch (item.type) {
      case 'collapse':
        return <NavCollapse key={item.id} menu={item} level={level + 1} />
      case 'item':
        return <NavItem key={item.id} item={item} level={level + 1} />
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        )
    }
  })

  const Icon = menu.icon
  const menuIcon = menu.icon ? (
    <Icon stroke={1.5} size="1.3rem" />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: selected === menu.id ? '8px' : '6px',
        height: selected === menu.id ? '8px' : '6px',
      }}
      fontSize={level > 0 ? 'inherit' : 'default'}
    />
  )

  return (
    <>
      <ListItemButton
        sx={{
          borderRadius: `${customization.borderRadius}px`,
          mb: 0.5,
          alignItems: level > 1 ? 'flex-start' : 'center',
          backgroundColor: level > 1 ? 'transparent !important' : undefined,
          py: level > 1 ? 1 : 1.25,
          pl: `${level * 24}px`,
        }}
        selected={selected === menu.id}
        onClick={handleClick}
      >
        <ListItemIcon
          sx={{
            my: 'auto',
            minWidth: !menu.icon ? 18 : 36,
          }}
        >
          {menuIcon}
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Typography
              variant={selected === menu.id ? 'h5' : 'body1'}
              color="inherit"
            >
              {menu.title}
            </Typography>
          }
          secondary={
            menu.caption && (
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
                {menu.caption}
              </Typography>
            )
          }
        />
        
        {open ? (
          <IconChevronUp
            stroke={1.5}
            size="1rem"
            style={{
              fontSize: '1rem',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          />
        ) : (
          <IconChevronDown
            stroke={1.5}
            size="1rem"
            style={{
              fontSize: '1rem',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          />
        )}
      </ListItemButton>
      
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            position: 'relative',
            '&:after': {
              content: "''",
              position: 'absolute',
              left: '32px',
              top: 0,
              height: '100%',
              width: '1px',
              opacity: 1,
              background: theme.palette.primary.light,
            },
          }}
        >
          {menus}
        </List>
      </Collapse>
    </>
  )
}

export default NavCollapse

