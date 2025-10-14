import {
  MenuRounded,
  NotificationsRounded,
  TuneRounded,
  SearchRounded,
  LogoutRounded,
  PersonRounded,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

type LayoutAppBarProps = {
  onMenuClick: () => void;
};

export const LayoutAppBar = ({ onMenuClick }: LayoutAppBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'background.default',
        borderRadius: 0,
        width: '100%',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        '& .MuiToolbar-root': {
          borderRadius: 0,
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: 56,
          height: 56,
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side - Company info, Hamburger and Search */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                background: (theme) => theme.app.gradients.brand,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="common.white">
                A
              </Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight={600}
              color="text.primary"
              sx={{ fontSize: '1.25rem' }}
            >
              {user?.company?.name}
            </Typography>
          </Box>

          <IconButton
            aria-label="Toggle navigation menu"
            onClick={onMenuClick}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              backgroundColor: 'background.default',
              p: 0.75,
            }}
          >
            <MenuRounded fontSize="small" />
          </IconButton>

          <TextField
            placeholder="Search"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="Notifications" size="small" sx={{ mr: -1 }}>
                    <TuneRounded />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1.5,
                backgroundColor: 'background.default',
                '& .MuiOutlinedInput-input': {
                  py: 1,
                },
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
            sx={{
              width: { xs: 200, md: 300, lg: 400 },
              maxWidth: 400,
            }}
            aria-label="Search"
          />
        </Box>

        {/* Right side - Settings and Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="Interface settings">
            <Badge color="error" variant="dot" overlap="circular">
              <NotificationsRounded fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton
            aria-label="Account menu"
            aria-controls={anchorEl ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            onClick={handleAvatarClick}
            sx={{ p: 0, ml: 1 }}
          >
            <Avatar sx={{ width: 36, height: 36, fontSize: '0.95rem', fontWeight: 600 }}>HJ</Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: 2,
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <MenuItem onClick={handleProfile}>
          <PersonRounded fontSize="small" sx={{ mr: 1.5 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutRounded fontSize="small" sx={{ mr: 1.5 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
