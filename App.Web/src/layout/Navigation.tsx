import { useState } from 'react';
import {
  Avatar,
  Box,
  Collapse,
  Drawer,
  IconButton,
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
  ColorLensRounded,
  DashboardRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  LockRounded,
  PeopleAltRounded,
  ScheduleRounded,
  SettingsRounded,
  TaskAltRounded,
  TextFieldsRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const DRAWER_WIDTH = 288;

type NavigationVariant = 'permanent' | 'temporary';

type NavigationProps = {
  variant: NavigationVariant;
  open: boolean;
  onClose?: () => void;
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
    id: 'pages',
    title: 'Pages',
    items: [
      { id: 'timesheet', label: 'Timesheet', path: '/timesheet', icon: <ScheduleRounded fontSize="small" /> },
      { id: 'tasks', label: 'Tasks', path: '/tasks', icon: <TaskAltRounded fontSize="small" /> },
      { id: 'people', label: 'People', path: '/people', icon: <PeopleAltRounded fontSize="small" /> },
      { id: 'reports', label: 'Reports', path: '/reports', icon: <AssessmentRounded fontSize="small" /> },
      { id: 'settings', label: 'Settings', path: '/settings', icon: <SettingsRounded fontSize="small" /> },
    ],
  },
  {
    id: 'utilities',
    title: 'Utilities',
    items: [
      { id: 'typography', label: 'Typography', path: '/utilities/typography', icon: <TextFieldsRounded fontSize="small" /> },
      { id: 'color', label: 'Color', path: '/utilities/color', icon: <ColorLensRounded fontSize="small" /> },
      { id: 'shadow', label: 'Shadow', path: '/utilities/shadow', icon: <BarChartRounded fontSize="small" /> },
      { id: 'sample', label: 'Sample Page', path: '/sample-page', icon: <TaskAltRounded fontSize="small" /> },
    ],
  },
];

const AUTH_ITEMS: NavItem[] = [
  { id: 'login', label: 'Login', path: '/login', icon: <LockRounded fontSize="small" /> },
  { id: 'register', label: 'Register', path: '/register', icon: <LockRounded fontSize="small" /> },
];

const NavListItem = ({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: (path?: string) => void;
}) => {
  const theme = useTheme();
  return (
    <ListItem disablePadding sx={{ position: 'relative' }}>
      <ListItemButton
        onClick={() => onClick(item.path)}
        selected={active}
        aria-label={item.ariaLabel ?? item.label}
        sx={{
          gap: 1.5,
          minHeight: 44,
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
            minWidth: 32,
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: active ? 600 : 500,
          }}
          primary={item.label}
        />
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

const NavigationContent = ({ onNavigate }: { onNavigate: (path?: string) => void }) => {
  const location = useLocation();
  const theme = useTheme();
  const [authExpanded, setAuthExpanded] = useState(true);

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
        py: 3,
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          mb: 1,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(
              theme.palette.primary.dark,
              0.64
            )})`,
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          GT
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            GoGoTime
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Productivity Suite
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        <List disablePadding>
          {PRIMARY_ITEMS.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              active={location.pathname === item.path}
              onClick={handleNavigate}
            />
          ))}
        </List>

        <NavSectionTitle title="Pages" />
        <List disablePadding>
          {PAGE_GROUPS[0].items.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              active={location.pathname.startsWith(item.path ?? '')}
              onClick={handleNavigate}
            />
          ))}
        </List>

        <List disablePadding sx={{ mt: 2 }}>
          <ListItem
            disablePadding
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
            }}
          >
          <ListItemButton
            onClick={() => setAuthExpanded((prev) => !prev)}
            sx={{ borderRadius: 1.5, minHeight: 44 }}
            aria-expanded={authExpanded}
            aria-controls="authentication-menu"
          >
              <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary' }}>
                <LockRounded fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Authentication"
                primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              />
              <IconButton
                edge="end"
                size="small"
                aria-label={authExpanded ? 'Collapse authentication menu' : 'Expand authentication menu'}
                sx={{ ml: 1 }}
                onClick={(event) => {
                  event.stopPropagation();
                  setAuthExpanded((prev) => !prev);
                }}
              >
                {authExpanded ? <ExpandLessRounded fontSize="small" /> : <ExpandMoreRounded fontSize="small" />}
              </IconButton>
            </ListItemButton>
          </ListItem>
          <Collapse in={authExpanded} timeout="auto" unmountOnExit>
            <List disablePadding id="authentication-menu" aria-label="Authentication">
              {AUTH_ITEMS.map((item) => (
                <NavListItem
                  key={item.id}
                  item={item}
                  active={location.pathname === item.path}
                  onClick={handleNavigate}
                />
              ))}
            </List>
          </Collapse>
        </List>

        <NavSectionTitle title="Utilities" />
        <List disablePadding>
          {PAGE_GROUPS[1].items.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              active={location.pathname.startsWith(item.path ?? '')}
              onClick={handleNavigate}
            />
          ))}
        </List>
      </Box>

      <Box
        sx={{
          mt: 'auto',
          px: 2,
          py: 2,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Need help?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View the documentation for implementation details.
        </Typography>
      </Box>
    </Box>
  );
};

export const Navigation = ({ variant, open, onClose }: NavigationProps) => {
  const navigate = useNavigate();
  const isPermanent = variant === 'permanent';
  const theme = useTheme();

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
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          borderWidth: 0,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0px 8px 24px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <NavigationContent onNavigate={handleNavigate} />
    </Drawer>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const drawerWidth = DRAWER_WIDTH;
