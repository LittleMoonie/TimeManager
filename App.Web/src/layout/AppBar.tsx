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
import { alpha } from '@mui/material/styles';

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
    <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(145,158,171,0.1)' }}>
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, md: 3 },
          gap: 2,
        }}
      >
        {!isDesktop && (
          <IconButton
            edge="start"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
            sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          >
            <MenuRounded />
          </IconButton>
        )}

        <TextField
          fullWidth
          placeholder="Search projects, tasks..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.92),
              '& .MuiOutlinedInput-input': {
                py: 1.2,
              },
            },
          }}
          sx={{
            maxWidth: { xs: '100%', md: 420, lg: 520 },
            flexGrow: 1,
          }}
          aria-label="Search"
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton aria-label="Notifications" sx={{ position: 'relative' }}>
            <Badge color="error" variant="dot" overlap="circular">
              <NotificationsRounded />
            </Badge>
          </IconButton>

          <IconButton aria-label="Interface settings">
            <TuneRounded />
          </IconButton>

          <IconButton
            aria-label="Account menu"
            aria-controls={anchorEl ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={anchorEl ? 'true' : undefined}
            onClick={handleAvatarClick}
            sx={{ p: 0 }}
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
            boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.16)',
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
