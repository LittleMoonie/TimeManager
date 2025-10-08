import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { Navigation, drawerWidth } from '@/layout/Navigation';
import { LayoutAppBar } from '@/layout/AppBar';
import { SettingsFab } from '@/components/SettingsFab';
import { APP_BAR_HEIGHT, DRAWER_WIDTH, PAGE_PADDING } from '@/constants/layout';

export const Shell = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    if (isDesktop) {
      setSidebarCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  const handleCloseNavigation = () => setMobileOpen(false);

  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 80 : DRAWER_WIDTH) : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'grey.100', // Contrast background
      }}
    >
      <LayoutAppBar onMenuClick={handleDrawerToggle} isDesktop={isDesktop} />
      
      <Navigation 
        variant={isDesktop ? 'permanent' : 'temporary'} 
        open={mobileOpen} 
        onClose={handleCloseNavigation}
        collapsed={sidebarCollapsed}
      />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: `${APP_BAR_HEIGHT + 16}px`, // AppBar height + small top margin
          pl: { lg: `${sidebarWidth}px` }, // Account for sidebar width
          pr: 2, // Right padding
          minHeight: '100vh',
        }}
      >
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, lg: 3 }, // Inner padding
            backgroundColor: 'background.paper', // White/paper background
            borderRadius: 1, 
            boxShadow: 0, // No shadow
            minHeight: `calc(100vh - ${APP_BAR_HEIGHT + 32}px)`, // Account for margins
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <SettingsFab />
    </Box>
  );
};

export default Shell;
