import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { Navigation } from '@/layout/Navigation';
import { LayoutAppBar } from '@/layout/AppBar';
import { SettingsFab } from '@/components/SettingsFab';
import { APP_BAR_HEIGHT, DRAWER_WIDTH } from '@/constants/layout';

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
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        p: 2,
      }}
    >
      <LayoutAppBar onMenuClick={handleDrawerToggle} />

      <Navigation
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={mobileOpen}
        onClose={handleCloseNavigation}
        collapsed={sidebarCollapsed}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${APP_BAR_HEIGHT}px`,
          ml: { lg: `${sidebarWidth}px` },
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          minHeight: `calc(100vh - ${APP_BAR_HEIGHT + 32}px)`,
          boxShadow: theme.shadows[1],
        }}
      >
        <Outlet />
      </Box>

      <SettingsFab />
    </Box>
  );
};

export default Shell;
