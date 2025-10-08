import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { Navigation, drawerWidth } from '@/layout/Navigation';
import { LayoutAppBar } from '@/layout/AppBar';
import { SettingsFab } from '@/components/SettingsFab';

export const Shell = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseNavigation = () => setMobileOpen(false);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Navigation variant={isDesktop ? 'permanent' : 'temporary'} open={mobileOpen} onClose={handleCloseNavigation} />

      <Box
        sx={{
          flexGrow: 1,
          ml: { lg: `${drawerWidth}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <LayoutAppBar onMenuClick={handleDrawerToggle} isDesktop={isDesktop} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: { xs: 8, md: 9 },
            px: { xs: 2.5, md: 3.5, xl: 5 },
            pb: { xs: 8, md: 10 },
            width: '100%',
            maxWidth: { xl: '1440px' },
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>

        <SettingsFab />
      </Box>
    </Box>
  );
};

export default Shell;
