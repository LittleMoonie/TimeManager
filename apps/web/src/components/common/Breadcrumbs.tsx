import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material'
import { useLocation, Link } from 'react-router-dom'
import type { ComponentType } from 'react'
import type { MenuConfig } from '@/types'

interface BreadcrumbsProps {
  separator: ComponentType<any>
  navigation: MenuConfig
  icon?: boolean
  title?: boolean
  rightAlign?: boolean
}

/**
 * Breadcrumb navigation component
 * TODO: Migrate from ui-component/extended/Breadcrumbs.js
 */
function Breadcrumbs({ separator: Separator, navigation, icon, title, rightAlign }: BreadcrumbsProps) {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: rightAlign ? 'flex-end' : 'flex-start' }}>
      <MuiBreadcrumbs separator={<Separator size={16} />} aria-label="breadcrumb">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="body2">Home</Typography>
        </Link>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1

          return isLast ? (
            <Typography key={name} variant="body2" color="text.primary">
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
          ) : (
            <Link key={name} to={routeTo} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="body2">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
            </Link>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}

export default Breadcrumbs
