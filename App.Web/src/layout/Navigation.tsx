import {
  AssessmentRounded,
  DashboardRounded,
  PeopleAltRounded,
  TaskAltRounded,
  PersonRounded,
  GroupsRounded,
  AccountBalanceRounded,
  SettingsRounded,
  BarChartRounded,
} from '@mui/icons-material';
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
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMenu } from '@/hooks/useMenu';
import { MenuCardDto } from '@/lib/api/models/MenuCardDto';

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

const getIconComponent = (iconName?: string): React.ReactNode => {
  switch (iconName) {
    case 'DashboardRounded':
      return <DashboardRounded fontSize="small" />;
    case 'AssessmentRounded':
      return <AssessmentRounded fontSize="small" />;
    case 'PeopleAltRounded':
      return <PeopleAltRounded fontSize="small" />;
    case 'TaskAltRounded':
      return <TaskAltRounded fontSize="small" />;
    case 'PersonRounded':
      return <PersonRounded fontSize="small" />;
    case 'GroupsRounded':
      return <GroupsRounded fontSize="small" />;
    case 'AccountBalanceRounded':
      return <AccountBalanceRounded fontSize="small" />;
    case 'SettingsRounded':
      return <SettingsRounded fontSize="small" />;
    case 'BarChartRounded':
      return <BarChartRounded fontSize="small" />;
    default:
      return <DashboardRounded fontSize="small" />;
  }
};

const NavigationContent = ({
  onNavigate,
  collapsed = false,
}: {
  onNavigate: (path?: string) => void;
  collapsed?: boolean;
}) => {
  const location = useLocation();
  const { menu, isLoading, isError } = useMenu();

  const handleNavigate = (path?: string) => {
    onNavigate(path);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !menu) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: 'error.main',
        }}
      >
        <Typography variant="body2">Error loading menu.</Typography>
      </Box>
    );
  }

  const primaryItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: getIconComponent('DashboardRounded'),
      ariaLabel: 'Dashboard',
    },
  ];

  const pageGroups: NavGroup[] = menu.categories.map((category) => ({
    id: category.key,
    title: category.title,
    items: category.cards.map((card: MenuCardDto) => ({
      id: card.id,
      label: card.title,
      path: `/app${card.route}`,
      icon: getIconComponent(card.icon),
      ariaLabel: card.title,
    })),
  }));

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
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        <List disablePadding>
          {primaryItems.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              active={location.pathname === item.path}
              onClick={handleNavigate}
              collapsed={collapsed}
            />
          ))}
        </List>

        {pageGroups.map((group) => (
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
          boxShadow: theme.shadows[3],
          zIndex: theme.zIndex.drawer,
          top: 56, // Start below AppBar
          height: 'calc(100% - 56px)', // Full height minus AppBar
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

export const drawerWidth = DRAWER_WIDTH;
