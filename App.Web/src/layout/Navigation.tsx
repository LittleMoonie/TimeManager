import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
} from '@mui/material';
import {
  AssessmentRounded,
  BarChartRounded,
  ArticleRounded,
  DashboardRounded,
  PeopleAltRounded,
  ReceiptRounded,
  SettingsRounded,
  TaskAltRounded,
  TrendingUpRounded,
  DataObjectRounded,
  ShowChartRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 260;

type NavigationVariant = 'permanent' | 'temporary';

type NavigationProps = {
  variant: NavigationVariant;
  open: boolean;
  onClose?: () => void;
  collapsed?: boolean;
};

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  ariaLabel?: string;
};

type NavGroup = {
  id: string;
  title?: string;
  items: NavItem[];
};

const PRIMARY_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: <DashboardRounded fontSize="small" />,
    ariaLabel: 'Dashboard',
  },
];

const PAGE_GROUPS: NavGroup[] = [
  {
    id: 'application',
    title: 'Application',
    items: [
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: <TaskAltRounded fontSize="small" /> },
      { id: 'timesheet', label: 'Timesheet', path: '/timesheet', icon: <AssessmentRounded fontSize="small" /> },
      { id: 'people', label: 'People', path: '/people', icon: <PeopleAltRounded fontSize="small" /> },
      { id: 'reports', label: 'Reports', path: '/reports', icon: <AssessmentRounded fontSize="small" /> },
      { id: 'settings', label: 'Settings', path: '/settings', icon: <SettingsRounded fontSize="small" /> },
    ],
  },
];


const NavListItem = ({
  item,
  active,
  onClick,
  collapsed = false,
}: {
  item: NavItem;
  active: boolean;
  onClick: (path?: string) => void;
  collapsed?: boolean;
}) => {
  const theme = useTheme();
  return (
    <ListItem disablePadding sx={{ position: 'relative' }}>
      <ListItemButton
        onClick={() => onClick(item.path)}
        selected={active}
        aria-label={item.ariaLabel ?? item.label}
        sx={{
          gap: collapsed ? 0 : 1.5,
          minHeight: 44,
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.main,
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 'auto' : 32,
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: active ? 600 : 500,
            }}
            primary={item.label}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const NavSectionTitle = ({ title }: { title: string }) => (
  <Typography
    variant="caption"
    sx={{
      color: (theme) => alpha(theme.palette.text.secondary, 0.8),
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      px: 3,
      py: 2,
      fontWeight: 600,
    }}
  >
    {title}
  </Typography>
);

const NavigationContent = ({ onNavigate, collapsed = false }: { onNavigate: (path?: string) => void; collapsed?: boolean }) => {
  const location = useLocation();

  const handleNavigate = (path?: string) => {
    onNavigate(path);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        px: 1.5,
        py: 2,
        gap: 2,
      }}
    >
      {/* BERRY Logo */}
      {!collapsed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" fontWeight={700} color="white" sx={{ fontSize: '0.75rem' }}>
              B
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: '1rem' }}>
            BERRY
          </Typography>
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        <List disablePadding>
          {PRIMARY_ITEMS.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              active={location.pathname === item.path}
              onClick={handleNavigate}
              collapsed={collapsed}
            />
          ))}
        </List>

        {PAGE_GROUPS.map((group) => (
          <Box key={group.id}>
            {!collapsed && group.title && <NavSectionTitle title={group.title} />}
            <List disablePadding>
              {group.items.map((item) => (
                <NavListItem
                  key={item.id}
                  item={item}
                  active={location.pathname.startsWith(item.path ?? '')}
                  onClick={handleNavigate}
                  collapsed={collapsed}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const Navigation = ({ variant, open, onClose, collapsed = false }: NavigationProps) => {
  const navigate = useNavigate();
  const isPermanent = variant === 'permanent';
  const theme = useTheme();
  const drawerWidth = collapsed ? 80 : DRAWER_WIDTH;

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
    }
    if (!isPermanent && onClose) {
      onClose();
    }
  };

  return (
    <Drawer
      variant={variant}
      open={isPermanent ? true : open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          borderWidth: 0,
          borderRadius: 0,
          backgroundColor: theme.palette.background.default,
          boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
          zIndex: theme.zIndex.drawer,
          top: 0,
          height: '100%',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      <NavigationContent onNavigate={handleNavigate} collapsed={collapsed} />
    </Drawer>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const drawerWidth = DRAWER_WIDTH;
