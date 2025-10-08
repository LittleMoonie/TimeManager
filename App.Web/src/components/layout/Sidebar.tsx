import type { SvgIconComponent } from '@mui/icons-material';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  People,
  Schedule,
  Assessment,
  Settings,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: SvgIconComponent;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: Dashboard,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: Assignment,
  },
  {
    id: 'timesheet',
    label: 'Timesheet',
    path: '/timesheet',
    icon: Schedule,
  },
  {
    id: 'people',
    label: 'People',
    path: '/people',
    icon: People,
    roles: ['CEO', 'MANAGER'],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: Assessment,
    roles: ['CEO', 'MANAGER'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar = ({ onItemClick }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" component="div" fontWeight={700}>
          GoGoTime
        </Typography>
      </Toolbar>

      <Divider sx={{ mx: 3 }} />

      <List sx={{ mt: 1, px: 1, flexGrow: 1 }}>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isActive}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  transition: (theme) => theme.transitions.create(['background-color', 'color'], { duration: 150 }),
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'primary.main' : 'text.secondary',
                  },
                  '&.Mui-selected': {
                    backgroundColor: (theme) => `${theme.palette.primary.main}1A`,
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: (theme) => `${theme.palette.primary.main}24`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                  }}
                  primary={item.label}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
