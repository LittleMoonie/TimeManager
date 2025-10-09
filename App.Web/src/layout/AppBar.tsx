import { useState } from 'react';
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
import {
  MenuRounded,
  NotificationsRounded,
  TuneRounded,
  SearchRounded,
  LogoutRounded,
  PersonRounded,
} from '@mui/icons-material';

type LayoutAppBarProps = {
  onMenuClick: () => void;
  isDesktop: boolean;
};

export const LayoutAppBar = ({ onMenuClick, isDesktop }: LayoutAppBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
        {/* Left side - Company info */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: '1.25rem' }}>
              Acme Corporation
            </Typography>
          </Box>
        </Box>

        {/* Center - Hamburger and Search */}
        <Box sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1, alignItems: 'center', gap: 3 }}>
          {!isDesktop && (
            <IconButton
              aria-label="Toggle navigation menu"
              onClick={onMenuClick}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 0.75,
              }}
            >
              <MenuRounded fontSize="small" />
            </IconButton>
          )}

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
                  <IconButton
                    aria-label="Notifications"
                    size="small"
                    sx={{ mr: -1 }}
                  >
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
              width: { xs: '100%', md: 420, lg: 520 },
              maxWidth: 520,
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
            Haley James
          </Typography>
          <Typography variant="body2" color="text.secondary">
            haley.james@gogotime.com
          </Typography>
        </Box>
        <MenuItem onClick={handleMenuClose}>
          <PersonRounded fontSize="small" sx={{ mr: 1.5 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <LogoutRounded fontSize="small" sx={{ mr: 1.5 }} />
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};
