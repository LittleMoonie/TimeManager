# 🎨 Frontend Architecture

## Overview

The GoGoTime frontend is built with React 19, TypeScript, and Material-UI, following modern frontend architecture patterns with type-safe API integration.

## Technology Stack

### Core Framework
- **React 19** with Vite for development
- **TypeScript 5.9+** for type safety
- **Material-UI (MUI) v7** for UI components
- **Zustand** for global state management

### Development Tools
- **Vite 7+** for fast development and building
- **ESLint + Prettier** for code quality
- **Vitest** with React Testing Library for testing
- **Hot Reload** for instant development feedback

## Project Structure

```
App.Web/src/
├── components/          # 🧩 Reusable React components
│   ├── cards/          # Card components
│   ├── common/         # Common UI components  
│   ├── extended/       # Extended/custom components
│   ├── guards/         # Route protection components
│   └── layout/         # Layout components
├── features/           # 📦 Feature-based modules
│   ├── auth/          # Authentication features
│   ├── dashboard/     # Dashboard components
│   └── utilities/     # Utility pages
├── hooks/             # 🎣 Custom React hooks
├── lib/               # 📚 Libraries and utilities (e.g., API client, store, navigation config)
├── styles/            # 🎨 Styling and themes
├── themes/            # Material-UI theme configuration
└── types/             # 🏷️ TypeScript type definitions
```

## State Management

### Zustand Store Setup
```typescript
// lib/store/index.ts
import { create } from 'zustand';

interface CustomizationState {
  isOpen: string[];
  defaultId: string;
  fontFamily: string;
  borderRadius: number;
  opened: boolean;
}

export const useAppStore = create<CustomizationState>((set) => ({
  isOpen: [],
  defaultId: 'default',
  fontFamily: 'Roboto',
  borderRadius: 8,
  opened: true,
}));
```

## API Integration

### Type-Safe API Client
The frontend uses an **auto-generated, type-safe API client**:

```typescript
// lib/api/apiClient.ts
import { apiClient } from '@/lib/api/apiClient';
import { LoginDto } from "../../App.API/Dtos/Authentication/AuthenticationDto";
import { ApiError } from "./apiClient"; // Assuming ApiError is defined in apiClient.ts

// Type-safe API calls with auto-completion
const loginUser = async (credentials: LoginDto) => {
  try {
    const result = await apiClient.authenticationLogin(credentials);
    if (result.token) {
      // Token automatically stored
      return result;
    }
  } catch (error) {
    // Proper error handling with types
    if (error instanceof ApiError) {
      console.error('Login failed:', error.message);
    }
  }
};
```

### API Client Features
- ✅ **Auto-generated** from OpenAPI specification
- ✅ **Type-safe** with full TypeScript support
- ✅ **JWT handling** automatic token management
- ✅ **Error handling** with custom error types
- ✅ **Always in sync** with backend changes

## Component Architecture

### Component Hierarchy
```
App.tsx
├── Router (React Router)
├── MainLayout
│   ├── Header
│   ├── Sidebar
│   │   └── MenuList
│   │       ├── NavGroup
│   │       ├── NavItem  
│   │       └── NavCollapse
│   └── Main Content Area
└── Theme Provider (MUI)
```

### Layout Components
- **MainLayout**: Primary application layout
- **MinimalLayout**: Simplified layout for auth pages
- **Header**: Top navigation and user controls
- **Sidebar**: Navigation menu with collapsible items

### Route Protection
```typescript
// components/guards/AuthGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming a custom auth hook

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Routing Strategy

### Route Structure
```typescript
// src/app/router.tsx (Simplified)
import { createBrowserRouter, Navigate, Outlet, RouteObject } from "react-router-dom";
import { AuthGuard } from "../components/guards/AuthGuard";
import { GuestGuard } from "../components/guards/GuestGuard";

// Example Layouts and Pages
const LoginPage = () => <div>Login Page</div>;
const ForgotPasswordPage = () => <div>Forgot Password Page</div>;
const AppLayout = () => <Outlet />;
const HomePage = () => <div>Home Page</div>;
const TimesheetPage = () => <div>Timesheet Page</div>;
const PeoplePage = () => <div>People Page</div>;
const ReportsPage = () => <div>Reports Page</div>;
const ProfilePage = () => <div>Profile Page</div>;

const routeConfig: RouteObject[] = [
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestGuard>
        <ForgotPasswordPage />
      </GuestGuard>
    ),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "timesheet", element: <TimesheetPage /> },
      { path: "people", element: <PeoplePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routeConfig);
```

### Navigation Configuration
```typescript
// lib/menu-items/index.ts
export interface MenuItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapse';
  url?: string;
  icon?: React.ReactElement;
  children?: MenuItem[];
}
```

## Theming & Styling

### Material-UI Theme
```typescript
// themes/index.ts
export const theme = (customization: CustomizationState) => {
  return createTheme({
    palette: {
      primary: { main: '#673ab7' },
      secondary: { main: '#ff5722' },
    },
    typography: {
      fontFamily: customization.fontFamily,
    },
    shape: {
      borderRadius: customization.borderRadius,
    },
  });
};
```

### Responsive Design
- **Mobile-first** approach with breakpoints
- **Sidebar collapse** on mobile devices  
- **Responsive grid** using MUI Grid system
- **Touch-friendly** interface elements

## Development Workflow

### Component Development
```typescript
// Example component structure
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
  data?: any[];
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, data = [] }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{title}</Typography>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};
```

### Testing Strategy
```typescript
// Component testing with React Testing Library
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Code Splitting
- **Lazy loading** of route components
- **Dynamic imports** for heavy components
- **Bundle analysis** with Vite bundle analyzer

### Optimization Techniques
- **React.memo** for expensive re-renders
- **useMemo/useCallback** for expensive calculations
- **Virtualization** for large lists (if needed)
- **Image optimization** with proper formats

## Build & Deployment

### Development Build
```bash
# Start development server with hot reload
yarn dev

# Type checking
yarn typecheck

# Linting and formatting  
yarn lint
yarn format
```

### Production Build
```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

### Docker Integration
The frontend is containerized with:
- **Multi-stage Dockerfile** for optimization
- **Nginx** serving in production
- **Hot reload** in development via Docker Compose watch

## Best Practices

### Code Organization
- **Feature-based** folder structure
- **Barrel exports** for clean imports
- **Consistent naming** conventions
- **TypeScript strict mode** enabled

### Performance
- **Lazy load** non-critical components
- **Optimize images** and assets
- **Minimize bundle size** with tree shaking
- **Use production builds** for deployment

### Accessibility
- **Semantic HTML** elements
- **ARIA labels** where needed
- **Keyboard navigation** support
- **Color contrast** compliance

### Security
- **Input validation** on all forms
- **XSS prevention** with proper escaping
- **Secure API calls** with proper headers
- **Environment variables** for sensitive config

---

**🎯 Key Benefits:**
- **Type Safety**: Full TypeScript coverage with auto-generated API types
- **Developer Experience**: Hot reload, excellent tooling, clear architecture
- **Maintainability**: Well-organized code structure and consistent patterns
- **Performance**: Optimized builds and modern development practices
- **Integration**: Seamless connection to backend via auto-generated client
