import { useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase } from '@mui/material'

// Project imports
import LogoSection from './LogoSection'
import SearchSection from './SearchSection'
import ProfileSection from './ProfileSection'
import NotificationSection from './NotificationSection'

// Assets
import { IconMenu2 } from '@tabler/icons-react'

interface HeaderProps {
  handleLeftDrawerToggle: () => void
}

/**
 * Main Header/Navbar Component
 * Converted from layout/MainLayout/Header/index.js
 */
function Header({ handleLeftDrawerToggle }: HeaderProps) {
  const theme = useTheme()

  return (
    <>
      {/* Logo & toggler button */}
      <Box
        sx={{
          width: '228px',
          display: 'flex',
          [theme.breakpoints.down('md')]: {
            width: 'auto',
          },
        }}
      >
        <Box 
          component="span" 
          sx={{ 
            display: { xs: 'none', md: 'block' }, 
            flexGrow: 1 
          }}
        >
          <LogoSection />
        </Box>
        
        <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
          <Avatar
            variant="rounded"
            onClick={handleLeftDrawerToggle}
            sx={{
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              width: 34,
              height: 34,
              '&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light,
              },
            }}
          >
            <IconMenu2 stroke={1.5} size="1.3rem" />
          </Avatar>
        </ButtonBase>
      </Box>

      {/* Header search */}
      <SearchSection />
      
      {/* Spacers */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* Notification & profile */}
      <NotificationSection />
      <ProfileSection />
    </>
  )
}

export default Header
