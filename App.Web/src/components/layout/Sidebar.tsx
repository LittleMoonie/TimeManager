import { useTheme } from '@mui/material/styles'
import { Box, Drawer, useMediaQuery } from '@mui/material'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { BrowserView, MobileView } from 'react-device-detect'

// Project imports
import MenuList from './MenuList'
import LogoSection from './LogoSection'
import MenuCard from './MenuCard'

interface SidebarProps {
  drawerOpen: boolean
  drawerToggle: () => void
  drawerWidth: number
  window?: Window
}

/**
 * Sidebar Drawer Component
 * Converted from layout/MainLayout/Sidebar/index.js
 */
function Sidebar({ drawerOpen, drawerToggle, drawerWidth, window: windowProp }: SidebarProps) {
  const theme = useTheme()
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'))

  const drawerContent = (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box
          sx={{
            display: 'flex',
            p: 2,
            mx: 'auto',
          }}
        >
          <LogoSection />
        </Box>
      </Box>
      
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            height: 'calc(100vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px',
            [theme.breakpoints.down('sm')]: {
              height: 'calc(100vh - 56px)',
            },
          }}
        >
          <MenuList />
          <MenuCard />
        </PerfectScrollbar>
      </BrowserView>
      
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
          <MenuCard />
        </Box>
      </MobileView>
    </>
  )

  const container = windowProp !== undefined ? () => windowProp.document.body : undefined

  return (
    <Box
      component="nav"
      sx={{
        [theme.breakpoints.up('md')]: {
          width: drawerWidth,
          flexShrink: 0,
        },
      }}
      aria-label="navigation"
    >
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: 'none',
            [theme.breakpoints.up('md')]: {
              top: '88px',
            },
          },
        }}
        ModalProps={{ keepMounted: true }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}

export default Sidebar
