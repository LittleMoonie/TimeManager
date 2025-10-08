# 🎨 Frontend Architecture

## Overview

The GoGoTime frontend is built with React 19, TypeScript, and Material-UI, following modern frontend architecture patterns with type-safe API integration.

## Technology Stack

### Core Framework
- **React 19.2.0** with Vite for development
- **TypeScript 5.9+** for type safety
- **Material-UI (MUI) v7** for UI components
- **Redux Toolkit** with React Redux for state management

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
├── lib/               # 📚 Libraries and utilities
│   ├── api/           # ✨ Auto-generated API client
│   ├── menu-items/   # Navigation configuration
│   ├── router.tsx     # React Router setup
│   ├── routes/        # Route definitions
│   └── store/         # Redux store configuration
├── styles/            # 🎨 Styling and themes
├── themes/            # Material-UI theme configuration
└── types/             # 🏷️ TypeScript type definitions
```

## State Management

### Redux Toolkit Setup
```typescript
// lib/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import customizationSlice from './slices/customizationSlice';

export const store = configureStore({
  reducer: {
    customization: customizationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Customization State
```typescript
// lib/store/slices/customizationSlice.ts
export interface CustomizationState {
  isOpen: string[];           // Opened menu items
  defaultId: string;          // Default opened menu
  fontFamily: string;         // Font family setting  
  borderRadius: number;       // UI border radius
  opened: boolean;            // Sidebar open state
}
```

## API Integration

### Type-Safe API Client
The frontend uses an **auto-generated, type-safe API client**:

```typescript
// lib/api/apiClient.ts
import { apiClient } from '@/lib/api/apiClient';

// Type-safe API calls with auto-completion
const loginUser = async (credentials: LoginRequest) => {
  try {
    const result = await apiClient.login(credentials);
    if (result.success && result.token) {
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
export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(/* auth state */);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Routing Strategy

### Route Structure
```typescript
// lib/routes/MainRoutes.tsx
const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/dashboard',
      element: <AuthGuard><DashboardDefault /></AuthGuard>
    },
    {
      path: '/utilities',
      children: [
        { path: 'typography', element: <Typography /> },
        { path: 'color', element: <Color /> },
      ]
    }
  ]
};
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
