# GoGoTime Component Library

> [!SUMMARY] **React Component Documentation**
> Comprehensive guide to GoGoTime's React component library, including design system, reusable components, usage patterns, and customization guidelines.

## 📋 Table of Contents

- [[#🎨 Design System|Design System]]
- [[#🧩 Common Components|Common Components]]
- [[#📱 Layout Components|Layout Components]]
- [[#🛡️ Guard Components|Guard Components]]
- [[#🔧 Form Components|Form Components]]
- [[#📊 Data Display Components|Data Display Components]]

---

## 🎨 Design System

### 🎯 Design Principles

> [!NOTE] **Component Design Philosophy**
> - **Consistency**: Uniform look and behavior across the application
> - **Accessibility**: WCAG 2.1 AA compliance for all components
> - **Flexibility**: Customizable through props and theming
> - **Performance**: Optimized for minimal re-renders
> - **Developer Experience**: TypeScript support with comprehensive prop types

### 🎨 Theme System

```typescript
// App.Web/src/styles/theme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles'

interface CustomTheme {
  colors: {
    primary: {
      main: string
      light: string
      dark: string
      contrastText: string
    }
    secondary: {
      main: string
      light: string
      dark: string
      contrastText: string
    }
    success: {
      main: string
      light: string
      dark: string
    }
    warning: {
      main: string
      light: string
      dark: string
    }
    error: {
      main: string
      light: string
      dark: string
    }
    info: {
      main: string
      light: string
      dark: string
    }
    grey: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
  }
  typography: {
    fontFamily: string
    fontSize: number
    h1: object
    h2: object
    h3: object
    h4: object
    h5: object
    h6: object
    body1: object
    body2: object
    caption: object
  }
  spacing: (factor: number) => string
  breakpoints: {
    values: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
  }
  shadows: string[]
  shape: {
    borderRadius: number
  }
}

const lightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#3498db',      // Blue
      light: '#5dade2',
      dark: '#2980b9',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#2ecc71',      // Green
      light: '#58d68d',
      dark: '#27ae60',
      contrastText: '#ffffff'
    },
    success: {
      main: '#27ae60',
      light: '#58d68d',
      dark: '#1e8449'
    },
    warning: {
      main: '#f39c12',
      light: '#f7dc6f',
      dark: '#d68910'
    },
    error: {
      main: '#e74c3c',
      light: '#ec7063',
      dark: '#c0392b'
    },
    info: {
      main: '#17a2b8',
      light: '#7fb3d3',
      dark: '#138496'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096'
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4
    }
  },
  spacing: 8,
  shape: {
    borderRadius: 8
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.15)',
    '0px 16px 32px rgba(0, 0, 0, 0.2)'
  ]
}

const darkTheme: ThemeOptions = {
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a9eff',
      light: '#7bb3ff',
      dark: '#2874d6',
      contrastText: '#ffffff'
    },
    background: {
      default: '#1a202c',
      paper: '#2d3748'
    },
    text: {
      primary: '#f7fafc',
      secondary: '#a0aec0'
    }
  }
}

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme(mode === 'light' ? lightTheme : darkTheme)
}
```

### 🔤 Typography Scale

```typescript
// App.Web/src/components/common/Typography.tsx
import React from 'react'
import { Typography as MuiTypography, TypographyProps } from '@mui/material'
import { styled } from '@mui/material/styles'

interface CustomTypographyProps extends TypographyProps {
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

const StyledTypography = styled(MuiTypography)<CustomTypographyProps>(({ theme, weight, size }) => ({
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }[weight || 'regular'],
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem'    // 36px
  }[size || 'base']
}))

export const Typography: React.FC<CustomTypographyProps> = ({ 
  children, 
  weight, 
  size, 
  ...props 
}) => {
  return (
    <StyledTypography weight={weight} size={size} {...props}>
      {children}
    </StyledTypography>
  )
}

// Usage Examples:
export const TypographyExamples = () => (
  <div>
    <Typography variant="h1" weight="bold">Main Heading</Typography>
    <Typography variant="h3" weight="semibold">Section Title</Typography>
    <Typography size="lg" weight="medium">Emphasized Text</Typography>
    <Typography size="base">Regular body text</Typography>
    <Typography size="sm" color="text.secondary">Helper text</Typography>
  </div>
)
```

---

## 🧩 Common Components

### 🔘 Button Component

```typescript
// App.Web/src/components/common/Button.tsx
import React, { forwardRef } from 'react'
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const StyledButton = styled(MuiButton)<{
  $variant?: ButtonProps['variant']
  $loading?: boolean
}>(({ theme, $variant, $loading }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  opacity: $loading ? 0.7 : 1,
  pointerEvents: $loading ? 'none' : 'auto',

  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px'
  },

  ...$variant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)',
    
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: '0 4px 8px rgba(52, 152, 219, 0.3)',
      transform: 'translateY(-1px)'
    },
    
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 4px rgba(52, 152, 219, 0.2)'
    }
  },

  ...$variant === 'secondary' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark
    }
  },

  ...$variant === 'outline' && {
    backgroundColor: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }
  },

  ...$variant === 'ghost' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },

  ...$variant === 'danger' && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    
    '&:hover': {
      backgroundColor: theme.palette.error.dark
    }
  }
}))

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  const renderIcon = () => {
    if (loading) {
      return <CircularProgress size={16} color="inherit" />
    }
    return icon
  }

  const renderContent = () => {
    if (loading && loadingText) {
      return loadingText
    }

    if (icon && iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          <span style={{ marginLeft: 8 }}>{children}</span>
        </>
      )
    }

    if (icon && iconPosition === 'right') {
      return (
        <>
          <span style={{ marginRight: 8 }}>{children}</span>
          {renderIcon()}
        </>
      )
    }

    return children
  }

  return (
    <StyledButton
      ref={ref}
      $variant={variant}
      $loading={loading}
      size={size}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </StyledButton>
  )
})

Button.displayName = 'Button'

// Usage Examples:
export const ButtonExamples = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <Button variant="primary">Primary Button</Button>
    <Button variant="secondary">Secondary Button</Button>
    <Button variant="outline">Outline Button</Button>
    <Button variant="ghost">Ghost Button</Button>
    <Button variant="danger">Danger Button</Button>
    <Button variant="primary" loading>Loading...</Button>
    <Button variant="primary" icon={<SaveIcon />}>Save</Button>
    <Button variant="outline" icon={<DownloadIcon />} iconPosition="right">
      Download
    </Button>
  </div>
)
```

### 🏷️ Badge Component

```typescript
// App.Web/src/components/common/Badge.tsx
import React from 'react'
import { Chip, ChipProps } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface BadgeProps extends Omit<ChipProps, 'color' | 'variant'> {
  variant?: 'filled' | 'outlined' | 'soft'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'small' | 'medium' | 'large'
  dot?: boolean
}

const StyledBadge = styled(Chip)<{
  $color?: BadgeProps['color']
  $variant?: BadgeProps['variant']
  $dot?: boolean
}>(({ theme, $color = 'primary', $variant = 'filled', $dot }) => {
  const colorPalette = theme.palette[$color] || theme.palette.primary

  return {
    height: 'auto',
    fontSize: '0.75rem',
    fontWeight: 500,
    borderRadius: theme.shape.borderRadius,
    
    ...$dot && {
      width: 8,
      height: 8,
      minWidth: 8,
      borderRadius: '50%',
      '& .MuiChip-label': {
        display: 'none'
      }
    },

    ...$variant === 'filled' && {
      backgroundColor: colorPalette.main,
      color: colorPalette.contrastText,
      
      '&:hover': {
        backgroundColor: colorPalette.dark
      }
    },

    ...$variant === 'outlined' && {
      backgroundColor: 'transparent',
      border: `1px solid ${colorPalette.main}`,
      color: colorPalette.main,
      
      '&:hover': {
        backgroundColor: `${colorPalette.main}10`
      }
    },

    ...$variant === 'soft' && {
      backgroundColor: `${colorPalette.main}15`,
      color: colorPalette.main,
      border: 'none',
      
      '&:hover': {
        backgroundColor: `${colorPalette.main}25`
      }
    }
  }
})

export const Badge: React.FC<BadgeProps> = ({
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  dot = false,
  children,
  ...props
}) => {
  return (
    <StyledBadge
      $color={color}
      $variant={variant}
      $dot={dot}
      size={size}
      label={dot ? '' : children}
      {...props}
    />
  )
}

// Usage Examples:
export const BadgeExamples = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <Badge color="primary">Primary</Badge>
    <Badge color="success">Success</Badge>
    <Badge color="warning">Warning</Badge>
    <Badge color="error">Error</Badge>
    <Badge variant="outlined" color="info">Outlined</Badge>
    <Badge variant="soft" color="secondary">Soft</Badge>
    <Badge dot color="success" />
    <Badge dot color="error" />
  </div>
)
```

### 💳 Card Component

```typescript
// App.Web/src/components/common/Card.tsx
import React from 'react'
import { Card as MuiCard, CardContent, CardHeader, CardActions, CardProps } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface CustomCardProps extends CardProps {
  variant?: 'elevation' | 'outlined' | 'filled'
  interactive?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  header?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
}

const StyledCard = styled(MuiCard)<{
  $variant?: CustomCardProps['variant']
  $interactive?: boolean
  $padding?: CustomCardProps['padding']
}>(({ theme, $variant = 'elevation', $interactive, $padding = 'medium' }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  ...$variant === 'elevation' && {
    boxShadow: theme.shadows[1],
    border: 'none',
    
    ...$interactive && {
      '&:hover': {
        boxShadow: theme.shadows[3],
        transform: 'translateY(-2px)'
      }
    }
  },

  ...$variant === 'outlined' && {
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    
    ...$interactive && {
      '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
      }
    }
  },

  ...$variant === 'filled' && {
    backgroundColor: theme.palette.grey[50],
    border: 'none',
    boxShadow: 'none'
  },

  ...$interactive && {
    cursor: 'pointer',
    
    '&:active': {
      transform: 'translateY(0)'
    }
  },

  '& .MuiCardContent-root': {
    padding: {
      none: 0,
      small: theme.spacing(1),
      medium: theme.spacing(2),
      large: theme.spacing(3)
    }[$padding],
    
    '&:last-child': {
      paddingBottom: {
        none: 0,
        small: theme.spacing(1),
        medium: theme.spacing(2),
        large: theme.spacing(3)
      }[$padding]
    }
  }
}))

export const Card: React.FC<CustomCardProps> = ({
  variant = 'elevation',
  interactive = false,
  padding = 'medium',
  header,
  actions,
  children,
  onClick,
  ...props
}) => {
  return (
    <StyledCard
      $variant={variant}
      $interactive={interactive}
      $padding={padding}
      onClick={onClick}
      {...props}
    >
      {header && <CardHeader title={header} />}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  )
}

// Usage Examples:
export const CardExamples = () => (
  <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
    <Card header="Default Card">
      This is a default elevated card with medium padding.
    </Card>
    
    <Card variant="outlined" interactive>
      This is an interactive outlined card. Click me!
    </Card>
    
    <Card 
      variant="filled" 
      padding="large"
      actions={
        <div>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      }
    >
      This is a filled card with large padding and actions.
    </Card>
  </div>
)
```

---

## 📱 Layout Components

### 🏠 Main Layout

```typescript
// App.Web/src/components/layout/MainLayout.tsx
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'

const DRAWER_WIDTH = 280
const COLLAPSED_DRAWER_WIDTH = 64

interface MainLayoutProps {
  children?: React.ReactNode
}

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}))

const LayoutContent = styled(Box)<{ $sidebarOpen: boolean; $isMobile: boolean }>(
  ({ theme, $sidebarOpen, $isMobile }) => ({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginLeft: $isMobile ? 0 : $sidebarOpen ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
)

const Main = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(2),
  minHeight: 'calc(100vh - 64px)', // Account for header height
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1)
  }
}))

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
    }
  }

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false)
  }

  return (
    <LayoutRoot>
      <Header 
        onSidebarToggle={handleSidebarToggle}
        sidebarOpen={isMobile ? mobileDrawerOpen : sidebarOpen}
      />
      
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileDrawerOpen}
        onMobileClose={handleMobileDrawerClose}
        variant={isMobile ? 'temporary' : 'persistent'}
        width={DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
      />
      
      <LayoutContent $sidebarOpen={sidebarOpen} $isMobile={isMobile}>
        <Main>
          {children || <Outlet />}
        </Main>
        <Footer />
      </LayoutContent>
    </LayoutRoot>
  )
}
```

### 🎯 Header Component

```typescript
// App.Web/src/components/layout/Header.tsx
import React from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
  Logout
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import { useAuth } from '@/hooks/useAuth'
import { SearchInput } from './SearchInput'
import { NotificationDropdown } from './NotificationDropdown'

const HEADER_HEIGHT = 64

interface HeaderProps {
  onSidebarToggle: () => void
  sidebarOpen: boolean
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  height: HEADER_HEIGHT,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const StyledToolbar = styled(Toolbar)({
  minHeight: HEADER_HEIGHT,
  paddingLeft: 16,
  paddingRight: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const LeftSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16
})

const CenterSection = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  maxWidth: 600,
  margin: '0 auto'
})

const RightSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8
})

export const Header: React.FC<HeaderProps> = ({ onSidebarToggle, sidebarOpen }) => {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    logout()
  }

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        <LeftSection>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onSidebarToggle}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            GoGoTime
          </Typography>
        </LeftSection>

        <CenterSection>
          <SearchInput
            placeholder="Search projects, tasks, or time entries..."
            onSearch={(query) => console.log('Search:', query)}
          />
        </CenterSection>

        <RightSection>
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit">
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton
              edge="end"
              aria-label="account menu"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                src={user?.avatarUrl}
                alt={user?.username}
                sx={{ width: 32, height: 32 }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </RightSection>
      </StyledToolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>

      {/* Notification Dropdown */}
      <NotificationDropdown
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
      />
    </StyledAppBar>
  )
}
```

### 📋 Sidebar Component

```typescript
// App.Web/src/components/layout/Sidebar.tsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Collapse,
  Typography
} from '@mui/material'
import {
  Dashboard,
  Schedule,
  Assignment,
  People,
  BarChart,
  Settings,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'

import { usePermissions } from '@/hooks/usePermissions'

interface SidebarProps {
  open: boolean
  mobileOpen: boolean
  onMobileClose: () => void
  variant: 'permanent' | 'persistent' | 'temporary'
  width: number
  collapsedWidth: number
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  permission?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard'
  },
  {
    id: 'time-tracking',
    label: 'Time Tracking',
    icon: <Schedule />,
    children: [
      {
        id: 'timer',
        label: 'Timer',
        icon: <Schedule />,
        path: '/time-tracking/timer'
      },
      {
        id: 'entries',
        label: 'Time Entries',
        icon: <Assignment />,
        path: '/time-tracking/entries'
      }
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: <Assignment />,
    path: '/projects',
    permission: 'projects:read'
  },
  {
    id: 'team',
    label: 'Team',
    icon: <People />,
    path: '/team',
    permission: 'users:read'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart />,
    path: '/analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings />,
    path: '/settings'
  }
]

const StyledDrawer = styled(Drawer)<{ $collapsed: boolean }>(({ theme, $collapsed }) => ({
  '& .MuiDrawer-paper': {
    width: $collapsed ? 64 : 280,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    overflowX: 'hidden'
  }
}))

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  minHeight: 64,
  borderBottom: `1px solid ${theme.palette.divider}`
}))

const StyledListItemButton = styled(ListItemButton)<{ $active?: boolean; $collapsed?: boolean }>(
  ({ theme, $active, $collapsed }) => ({
    margin: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    minHeight: 48,
    
    ...$active && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      
      '&:hover': {
        backgroundColor: theme.palette.primary.dark
      },
      
      '& .MuiListItemIcon-root': {
        color: 'inherit'
      }
    },
    
    ...$collapsed && {
      justifyContent: 'center',
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    }
  })
)

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  mobileOpen,
  onMobileClose,
  variant,
  width,
  collapsedWidth
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['time-tracking'])

  const isCollapsed = variant !== 'temporary' && !open
  const drawerOpen = variant === 'temporary' ? mobileOpen : open

  const handleItemClick = (item: MenuItem) => {
    if (item.path) {
      navigate(item.path)
      if (variant === 'temporary') {
        onMobileClose()
      }
    } else if (item.children) {
      toggleExpanded(item.id)
    }
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path
    }
    if (item.children) {
      return item.children.some(child => location.pathname === child.path)
    }
    return false
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    // Check permissions
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    const hasChildren = item.children && item.children.length > 0
    const expanded = expandedItems.includes(item.id)
    const active = isActive(item)

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <StyledListItemButton
            $active={active}
            $collapsed={isCollapsed}
            onClick={() => handleItemClick(item)}
            sx={{ pl: 2 + level * 2 }}
          >
            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40 }}>
              {item.icon}
            </ListItemIcon>
            
            {!isCollapsed && (
              <>
                <ListItemText primary={item.label} />
                {hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </StyledListItemButton>
        </ListItem>

        {hasChildren && !isCollapsed && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isCollapsed && (
        <SidebarHeader>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            GoGoTime
          </Typography>
        </SidebarHeader>
      )}

      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Box>
  )

  return (
    <StyledDrawer
      variant={variant}
      open={drawerOpen}
      onClose={onMobileClose}
      $collapsed={isCollapsed}
      ModalProps={{
        keepMounted: true // Better mobile performance
      }}
    >
      {drawerContent}
    </StyledDrawer>
  )
}
```

---

## 🛡️ Guard Components

### 🔐 Permission Guard

```typescript
// App.Web/src/components/guards/PermissionGuard.tsx
import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Lock, ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  permission?: string
  role?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

const DefaultForbiddenFallback: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center',
      p: 4
    }}
  >
    <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h5" gutterBottom>
      Access Denied
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
      You don't have permission to access this resource.
    </Typography>
    <Button
      variant="outlined"
      startIcon={<ArrowBack />}
      onClick={onBack}
    >
      Go Back
    </Button>
  </Box>
)

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  role,
  permissions,
  requireAll = false,
  fallback,
  children
}) => {
  const navigate = useNavigate()
  const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = usePermissions()

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback || <DefaultForbiddenFallback onBack={() => navigate(-1)} />}</>
  }

  // Check role
  if (role && !hasRole(role)) {
    return <>{fallback || <DefaultForbiddenFallback onBack={() => navigate(-1)} />}</>
  }

  // Check multiple permissions
  if (permissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasAccess) {
      return <>{fallback || <DefaultForbiddenFallback onBack={() => navigate(-1)} />}</>
    }
  }

  return <>{children}</>
}

// Higher-order component version
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function PermissionGuardedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

// Usage Examples:
export const PermissionGuardExamples = () => (
  <div>
    {/* Simple permission check */}
    <PermissionGuard permission="users:read">
      <UserList />
    </PermissionGuard>

    {/* Role-based access */}
    <PermissionGuard role="admin">
      <AdminPanel />
    </PermissionGuard>

    {/* Multiple permissions (any) */}
    <PermissionGuard permissions={['users:create', 'users:update']}>
      <UserManagement />
    </PermissionGuard>

    {/* Multiple permissions (all required) */}
    <PermissionGuard permissions={['admin:full', 'system:manage']} requireAll>
      <SystemSettings />
    </PermissionGuard>

    {/* Custom fallback */}
    <PermissionGuard 
      permission="reports:read" 
      fallback={<div>Please contact your administrator for access.</div>}
    >
      <Reports />
    </PermissionGuard>
  </div>
)
```

### 🔄 Route Guard

```typescript
// App.Web/src/components/guards/RouteGuard.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

import { useAuth } from '@/hooks/useAuth'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireGuest?: boolean
  redirectTo?: string
}

const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}
  >
    <CircularProgress />
  </Box>
)

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requireGuest = false,
  redirectTo
}) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return <LoadingFallback />
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo || '/auth/login'}
        state={{ from: location }}
        replace
      />
    )
  }

  // Redirect to dashboard if guest route but user is authenticated
  if (requireGuest && isAuthenticated) {
    return <Navigate to={redirectTo || '/dashboard'} replace />
  }

  return <>{children}</>
}

// Protected Route Component
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireAuth>{children}</RouteGuard>
)

// Guest Route Component (for login, register pages)
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RouteGuard requireGuest>{children}</RouteGuard>
)

// Usage in Router:
export const RouterExample = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />

    {/* Guest only routes */}
    <Route path="/auth/login" element={
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    } />

    {/* Protected routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    } />

    {/* Protected with permission check */}
    <Route path="/admin" element={
      <ProtectedRoute>
        <PermissionGuard permission="admin:access">
          <AdminPage />
        </PermissionGuard>
      </ProtectedRoute>
    } />
  </Routes>
)
```

---

## 🔧 Form Components

### 📝 Form Input Components

```typescript
// App.Web/src/components/forms/FormInput.tsx
import React, { forwardRef } from 'react'
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

export interface FormInputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard'
  showPassword?: boolean
  onTogglePassword?: () => void
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s ease-in-out',
    
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      }
    },
    
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
        borderColor: theme.palette.primary.main,
      }
    },
    
    '&.Mui-error': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      }
    }
  },
  
  '& .MuiFormLabel-root': {
    fontWeight: 500,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main
    }
  }
}))

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  type,
  showPassword,
  onTogglePassword,
  InputProps,
  ...props
}, ref) => {
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const endAdornment = isPassword ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={onTogglePassword}
        edge="end"
        size="small"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : InputProps?.endAdornment

  return (
    <StyledTextField
      ref={ref}
      type={inputType}
      variant="outlined"
      fullWidth
      InputProps={{
        ...InputProps,
        endAdornment
      }}
      {...props}
    />
  )
})

FormInput.displayName = 'FormInput'

// Usage Examples:
export const FormInputExamples = () => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
      <FormInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        helperText="We'll never share your email"
      />
      
      <FormInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        helperText="Password must be at least 8 characters"
      />
      
      <FormInput
        label="Amount"
        type="number"
        placeholder="0.00"
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }}
      />
      
      <FormInput
        label="Search"
        placeholder="Search..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
    </div>
  )
}
```

---

## 📊 Data Display Components

### 📋 Data Table Component

```typescript
// App.Web/src/components/data/DataTable.tsx
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Skeleton
} from '@mui/material'
import { MoreVert, FilterList } from '@mui/icons-material'
import { styled } from '@mui/material/styles'

export interface Column<T> {
  id: keyof T
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  selectable?: boolean
  sortable?: boolean
  pagination?: boolean
  rowsPerPageOptions?: number[]
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  actions?: (row: T) => React.ReactNode
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1]
}))

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  
  '& .MuiTableCell-head': {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`
  }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '08',
    
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '12'
    }
  }
}))

const StyledTableCell = styled(TableCell)({
  borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
})

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  selectable = false,
  sortable = true,
  pagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  onRowClick,
  onSelectionChange,
  onSort,
  actions
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1] || 10)
  const [selected, setSelected] = useState<T[]>([])
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [actionAnchor, setActionAnchor] = useState<{ element: HTMLElement; row: T } | null>(null)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      setSelected(newSelected)
      onSelectionChange?.(newSelected)
    } else {
      setSelected([])
      onSelectionChange?.([])
    }
  }

  const handleSelect = (row: T) => {
    const selectedIndex = selected.findIndex(item => item.id === row.id)
    let newSelected: T[] = []

    if (selectedIndex === -1) {
      newSelected = [...selected, row]
    } else {
      newSelected = selected.filter(item => item.id !== row.id)
    }

    setSelected(newSelected)
    onSelectionChange?.(newSelected)
  }

  const handleSort = (column: keyof T) => {
    if (!sortable) return

    const isAsc = sortColumn === column && sortDirection === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'
    
    setSortColumn(column)
    setSortDirection(newDirection)
    onSort?.(column, newDirection)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleActionClick = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation()
    setActionAnchor({ element: event.currentTarget, row })
  }

  const handleActionClose = () => {
    setActionAnchor(null)
  }

  const isSelected = (row: T) => selected.findIndex(item => item.id === row.id) !== -1
  const numSelected = selected.length
  const rowCount = Math.min(data.length, rowsPerPage)

  // Loading skeleton
  if (loading) {
    return (
      <StyledTableContainer component={Paper}>
        <Table>
          <StyledTableHead>
            <TableRow>
              {selectable && <TableCell padding="checkbox" />}
              {columns.map((column) => (
                <TableCell key={String(column.id)}>{column.label}</TableCell>
              ))}
              {actions && <TableCell />}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {Array.from({ length: rowsPerPage }).map((_, index) => (
              <TableRow key={index}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.id)}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <Skeleton variant="circular" width={24} height={24} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <StyledTableContainer component={Paper}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No data available
          </Typography>
        </Box>
      </StyledTableContainer>
    )
  }

  const displayData = pagination 
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data

  return (
    <StyledTableContainer component={Paper}>
      <Table>
        <StyledTableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                align={column.align}
                style={{ minWidth: column.minWidth }}
              >
                {column.sortable !== false && sortable ? (
                  <TableSortLabel
                    active={sortColumn === column.id}
                    direction={sortColumn === column.id ? sortDirection : 'asc'}
                    onClick={() => handleSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
            
            {actions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </StyledTableHead>

        <TableBody>
          {displayData.map((row) => {
            const isItemSelected = isSelected(row)
            
            return (
              <StyledTableRow
                key={row.id}
                selected={isItemSelected}
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {selectable && (
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onChange={() => handleSelect(row)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </StyledTableCell>
                )}
                
                {columns.map((column) => {
                  const value = row[column.id]
                  return (
                    <StyledTableCell key={String(column.id)} align={column.align}>
                      {column.render ? column.render(value, row) : String(value)}
                    </StyledTableCell>
                  )
                })}
                
                {actions && (
                  <StyledTableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleActionClick(e, row)}
                    >
                      <MoreVert />
                    </IconButton>
                  </StyledTableCell>
                )}
              </StyledTableRow>
            )
          })}
        </TableBody>
      </Table>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Actions Menu */}
      {actionAnchor && (
        <Menu
          anchorEl={actionAnchor.element}
          open={Boolean(actionAnchor)}
          onClose={handleActionClose}
        >
          {actions?.(actionAnchor.row)}
        </Menu>
      )}
    </StyledTableContainer>
  )
}

// Usage Example:
interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createdAt: string
}

export const DataTableExample = () => {
  const columns: Column<User>[] = [
    { id: 'name', label: 'Name', minWidth: 150 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { 
      id: 'role', 
      label: 'Role', 
      minWidth: 100,
      render: (value) => <Badge color="primary">{value}</Badge>
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (value) => (
        <Badge color={value === 'active' ? 'success' : 'error'}>
          {value}
        </Badge>
      )
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 120,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]

  const users: User[] = [
    // Sample data...
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      selectable
      onSelectionChange={(selected) => console.log('Selected:', selected)}
      onRowClick={(user) => console.log('Clicked:', user)}
      actions={(user) => (
        <>
          <MenuItem onClick={() => console.log('Edit', user)}>Edit</MenuItem>
          <MenuItem onClick={() => console.log('Delete', user)}>Delete</MenuItem>
        </>
      )}
    />
  )
}
```

---

## 🏷️ Tags

#components #react #material-ui #design-system #typescript #ui-library

**Related Documentation:**
- [[FRONTEND_ARCHITECTURE]] - React application structure
- [[CODING_STANDARDS]] - Component development standards
- [[DASHBOARD_FEATURES]] - Dashboard-specific components
- [[TIME_TRACKING]] - Time tracking UI components

---

> [!NOTE] **Document Maintenance**
> **Last Updated:** {date}  
> **Version:** 1.0.0  
> **Maintainers:** Frontend Team (Lazaro, Alexy, Massi, Lounis)

> [!TIP] **Component Library Best Practices**
> - Always provide TypeScript interfaces for props
> - Include comprehensive examples for each component
> - Follow accessibility guidelines (WCAG 2.1 AA)
> - Use consistent naming conventions across components
> - Implement proper error boundaries and loading states
> - Test components in isolation using Storybook or similar tools
