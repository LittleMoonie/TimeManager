# 🧩 Frontend Components Library

## Overview

GoGoTime's component library is built on Material-UI (MUI) v7 with custom extensions and follows atomic design principles for maximum reusability and maintainability.

## Component Architecture

### Component Hierarchy

```
Components/
├── 🎯 Common/              # Base reusable components
├── 🎨 Extended/           # Enhanced MUI components
├── 🃏 Cards/              # Card-based components
├── 🛡️ Guards/             # Route protection components
├── 🏗️ Layout/             # Layout and navigation
└── 📊 Feature-specific/   # Domain-specific components
```

## Common Components

### Base Components

Located in `src/components/common/`

#### Loadable Component

```typescript
// components/common/Loadable.tsx
import { Suspense, ComponentType, ReactElement } from 'react';
import Loader from './Loader';

const Loadable = <P extends object>(Component: ComponentType<P>) => {
  return (props: P): ReactElement => (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );
};

export default Loadable;
```

#### Breadcrumbs Navigation

```typescript
// components/common/Breadcrumbs.tsx
import { useTheme } from '@mui/material/styles';
import { Box, Card, Divider, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  navigation: { id: string; title: string; type: string; url?: string; children?: any[] };
  title?: boolean;
  titleBottom?: boolean;
  card?: boolean;
  divider?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  navigation,
  title = true,
  card = true,
  divider = true
}) => {
  const theme = useTheme();

  const list = navigation.children?.map((item) => {
    switch (item.type) {
      case 'group':
        return (
          <Link key={item.id} to={item.url || '#'}>
            <Typography variant="subtitle1" color="text.primary">
              {item.title}
            </Typography>
          </Link>
        );
      default:
        return (
          <Link key={item.id} to={item.url || '#'}>
            <Typography variant="subtitle1" color="text.primary">
              {item.title}
            </Typography>
          </Link>
        );
    }
  });

  return (
    <Card
      sx={{
        marginBottom: theme.spacing(3),
        border: !card ? 'none' : '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius,
        bgcolor: card ? theme.palette.background.paper : 'transparent',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          {title && (
            <Typography variant="h3" color="text.primary">
              {navigation.title}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {list}
          </Box>
        </Box>
      </Box>
      {divider && <Divider />}
    </Card>
  );
};
```

### Logo Component

```typescript
// components/common/Logo.tsx
import { ButtonBase } from '@mui/material';
import { Link } from 'react-router-dom'; // Using react-router-dom Link

interface LogoProps {
  sx?: object; // Use object for general SxProps
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ sx, to }) => {
  return (
    <ButtonBase
      disableRipple
      component={Link} // Use Link from react-router-dom
      to={to || '/'}
      sx={sx}
    >
      {/* Your SVG or image logo here */}
      <img src="/path/to/your/logo.svg" alt="GoGoTime Logo" style={{ height: 32 }} />
    </ButtonBase>
  );
};
```

## Extended Components

### Enhanced Avatar Component

Located in `src/components/extended/`

```typescript
// components/extended/Avatar.tsx
interface AvatarProps extends MUIAvatarProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  outline?: boolean;
  size?: 'badge' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
  children,
  color = 'primary',
  outline = false,
  size = 'md',
  sx,
  ...others
}) => {
  // Enhanced avatar with color and size variants
};
```

### Usage Example

```typescript
<Avatar
  color="primary"
  size="lg"
  outline
>
  <IconUser />
</Avatar>
```

## Card Components

### Main Card Component

```typescript
// components/cards/MainCard.tsx
interface MainCardProps {
  border?: boolean;
  boxShadow?: boolean;
  children: ReactNode;
  content?: boolean;
  contentClass?: string;
  contentSX?: object;
  darkTitle?: boolean;
  secondary?: ReactElement | string;
  shadow?: string;
  sx?: object;
  title?: ReactElement | string;
}

export const MainCard: React.FC<MainCardProps> = ({
  border = true,
  boxShadow = false,
  children,
  content = true,
  contentClass = '',
  contentSX = {},
  darkTitle = false,
  secondary,
  shadow,
  sx = {},
  title,
  ...others
}) => {
  return (
    <Card
      sx={{
        border: border ? 1 : 0,
        borderColor: theme.palette.divider,
        borderRadius: theme.shape.borderRadius,
        boxShadow: boxShadow ? shadow : 'none',
        ...sx
      }}
      {...others}
    >
      {/* Card header with title and secondary action */}
      {title && (
        <CardHeader
          title={darkTitle ? <Typography variant="h3">{title}</Typography> : title}
          action={secondary}
        />
      )}

      {/* Card content */}
      {content && (
        <CardContent sx={contentSX} className={contentClass}>
          {children}
        </CardContent>
      )}
      {!content && children}
    </Card>
  );
};
```

### Secondary Action Component

```typescript
// components/cards/CardSecondaryAction.tsx
interface CardSecondaryActionProps {
  icon?: ReactElement;
  title?: string;
  link?: string;
}

export const CardSecondaryAction: React.FC<CardSecondaryActionProps> = ({
  icon,
  title,
  link
}) => {
  return (
    <ButtonBase sx={{ borderRadius: '12px' }}>
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.main',
          width: 22,
          height: 22
        }}
      >
        {icon}
      </Avatar>
    </ButtonBase>
  );
};
```

## Layout Components

### Main Layout Structure

```typescript
// components/layout/AppLayout.tsx
import { useAppStore } from '@/lib/store';

export const AppLayout = () => {
  const theme = useTheme();
  const matchDown = useMediaQuery(theme.breakpoints.down('lg'));

  const { opened } = useAppStore(); // Using Zustand store

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: theme.palette.background.default }}
      >
        <Header />
      </AppBar>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Main theme={theme} open={opened}>
        <Breadcrumbs />
        <Outlet />
      </Main>
    </Box>
  );
};
```

### Header Component

```typescript
// components/layout/Header.tsx
export const Header = () => {
  const theme = useTheme();

  return (
    <Toolbar>
      <Box sx={{ width: 228, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ flexGrow: 1 }}>
          <LogoSection />
        </Box>
      </Box>

      {/* Header content */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* Profile section */}
      <ProfileSection />
    </Toolbar>
  );
};
```

### Sidebar Navigation

```typescript
// components/layout/Sidebar.tsx
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';
import { MenuList } from './MenuList';
import { LogoSection } from './LogoSection'; // Assuming LogoSection is a component
import { useAppStore } from '@/lib/store';

export const Sidebar = () => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  const { opened, toggleDrawer } = useAppStore((state) => ({
    opened: state.opened,
    toggleDrawer: state.toggleDrawer, // Assuming a toggleDrawer action exists in your store
  }));

  const drawer = (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <LogoSection />
      </Box>
      <BrowserView>
        <PerfectScrollbar>
          <MenuList />
        </PerfectScrollbar>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? 260 : 'auto' }}>
      <Drawer
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={opened}
        onClose={toggleDrawer} // Use toggleDrawer from store
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
```

## Navigation Components

### Menu List Component

```typescript
// components/layout/MenuList.tsx
import { useAppStore } from '@/lib/store';
import { NavGroup } from './NavGroup'; // Assuming these components exist
import { NavCollapse } from './NavCollapse';
import { NavItem } from './NavItem';

export const MenuList = () => {
  const menuItems = useAppStore((state) => state.menuItems); // Assuming menuItems is part of the store state

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      switch (item.type) {
        case 'group':
          return <NavGroup key={item.id} item={item} />;
        case 'collapse':
          return <NavCollapse key={item.id} item={item} />;
        default:
          return <NavItem key={item.id} item={item} />;
      }
    });
  };

  return <>{renderNavItems(menuItems)}</>;
};
```

### Navigation Item Types

````typescript
// Navigation Item
export const NavItem = ({ item, level = 0 }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isSelected = pathname === item.url;

  return (
    <ListItemButton
      component={Link} // Use Link from react-router-dom
      to={item.url}
      selected={isSelected}
      sx={{ borderRadius: 1, mb: 0.5 }}
    >
      <ListItemIcon sx={{ my: 'auto', minWidth: 36 }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText
        primary={item.title}
        secondary={item.caption}
      />
    </ListItemButton>
  );
};

// Collapsible Navigation Group
export const NavCollapse = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.title} />
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />} {/* Use generic icons */}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {item.children?.map((childItem) => (
            <NavItem key={childItem.id} item={childItem} level={1} />
          ))}
        </List>
      </Collapse>
    </>
  );
};```

## Guard Components

### Authentication Guard
```typescript
// components/guards/AuthGuard.tsx
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming a custom auth hook

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // or loading spinner
  }

  return <>{children}</>;
};
````

### Guest Guard (Prevent logged-in users from accessing auth pages)

```typescript
// components/guards/GuestGuard.tsx
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming a custom auth hook

export const GuestGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
```

## Dashboard Components

### Earning Card Component

```typescript
// features/dashboard/components/EarningCard.tsx
interface EarningCardProps {
  primary: string;
  secondary: string;
  content: string;
  iconPrimary: ReactElement;
  color: string;
  footerData?: string;
}

export const EarningCard: React.FC<EarningCardProps> = ({
  primary,
  secondary,
  content,
  iconPrimary,
  color,
  footerData
}) => {
  return (
    <MainCard border={false} content={false}>
      <CardContent sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: `${color}.dark`,
                    mt: 1
                  }}
                >
                  {iconPrimary}
                </Avatar>
              </Grid>
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: `${color}.dark`,
                    cursor: 'pointer',
                    width: 34,
                    height: 34
                  }}
                >
                  <ArrowUpwardIcon fontSize="inherit" />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                  {primary}
                </Typography>
              </Grid>
              <Grid item>
                <Chip
                  variant="combined"
                  color="secondary"
                  label={secondary}
                  sx={{ mb: 1.25 }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 1.25 }}>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.secondary' }}>
              {content}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
};
```

## Component Development Guidelines

### Props Interface Pattern

```typescript
// Always define prop interfaces
interface ComponentProps {
  // Required props without defaults
  title: string;
  data: any[];

  // Optional props with types
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;

  // Callback functions
  onClick?: (event: MouseEvent) => void;
  onDataChange?: (data: any[]) => void;

  // Style props
  sx?: SxProps;
  className?: string;

  // Children
  children?: ReactNode;
}
```

### Default Props Pattern

```typescript
// Use default parameters for optional props
export const MyComponent: React.FC<ComponentProps> = ({
  title,
  data,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  onDataChange,
  sx = {},
  className = '',
  children,
}) => {
  // Component implementation
};
```

### Theming Integration

```typescript
// Always use theme for consistent styling
const MyComponent = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        ...sx
      }}
    >
      {children}
    </Box>
  );
};
```

## Testing Components

### Component Testing Pattern

```typescript
// MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../themes';
import MyComponent from './MyComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithTheme(<MyComponent title="Test" data={[]} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(
      <MyComponent title="Test" data={[]} onClick={handleClick} />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Best Practices

### Memo Usage

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo<Props>(({ data, onUpdate }) => {
  return (
    <div>
      {data.map(item => <ComplexItem key={item.id} item={item} />)}
    </div>
  );
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return data.map(item => complexProcessing(item));
}, [data]);
```

### Callback Optimization

```typescript
// Use useCallback for stable references
const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick],
);
```

---

**🎯 Key Benefits:**

- **Consistency**: All components follow the same patterns and conventions
- **Reusability**: Atomic design principles enable maximum component reuse
- **Type Safety**: Full TypeScript coverage with proper prop interfaces
- **Accessibility**: Built-in ARIA support through Material-UI base
- **Performance**: Optimized with memo, callbacks, and proper state management
- **Maintainability**: Clear structure and consistent testing patterns
