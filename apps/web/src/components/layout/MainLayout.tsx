import { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { 
  Box, 
  AppBar, 
  CssBaseline, 
  Toolbar, 
  useMediaQuery,
  useTheme 
} from '@mui/material'

// Project imports
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import Breadcrumbs from '@/components/common/Breadcrumbs'
import Customization from '@/components/layout/Customization'
import menuItems from '@/lib/menu-items'
import { setMenu } from '@/lib/store/slices/customizationSlice'
import type { RootState } from '@/lib/store/types'
import { IconChevronRight } from '@tabler/icons-react'

// Constants
const DRAWER_WIDTH = 260

interface MainLayoutProps {
  children?: ReactNode
}

/**
 * Main application layout with sidebar, header, and navigation
 * Converted from original Berry Dashboard MainLayout
 */
function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme()
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'))
  
  const dispatch = useDispatch()
  const leftDrawerOpened = useSelector((state: RootState) => state.customization.opened)

  const handleLeftDrawerToggle = () => {
    dispatch(setMenu(!leftDrawerOpened))
  }

  useEffect(() => {
    dispatch(setMenu(!matchDownMd))
  }, [matchDownMd, dispatch])

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('width'),
          width: leftDrawerOpened ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
          ml: leftDrawerOpened ? `${DRAWER_WIDTH}px` : 0,
        }}
      >
        <Toolbar>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar 
        drawerOpen={leftDrawerOpened} 
        drawerToggle={handleLeftDrawerToggle}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: leftDrawerOpened ? 0 : `-${DRAWER_WIDTH}px`,
          [theme.breakpoints.down('md')]: {
            marginLeft: leftDrawerOpened ? 0 : '20px',
            width: leftDrawerOpened ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - 40px)`,
            p: 2,
          },
          [theme.breakpoints.down('sm')]: {
            marginLeft: leftDrawerOpened ? 0 : '10px',
            marginRight: leftDrawerOpened ? 0 : '10px',
            width: leftDrawerOpened ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - 20px)`,
          },
        }}
      >
        {/* Offset for fixed header */}
        <Toolbar />
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={IconChevronRight}
          navigation={menuItems}
          icon
          title
          rightAlign
        />
        
        {/* Page content */}
        <Box sx={{ mt: 2 }}>
          {children || <Outlet />}
        </Box>
      </Box>
      
      {/* Theme customization panel */}
      <Customization />
    </Box>
  )
}

export default MainLayout
