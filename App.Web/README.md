# GoGoTime Frontend

A modern, clean React application built with TypeScript, Material-UI, React Query, and React Router.

## 🏗️ Architecture

This frontend follows Next.js-style conventions with a clean, scalable architecture:

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (LoadingSpinner, ErrorMessage, etc.)
│   ├── layout/         # Layout components (AppLayout, Sidebar, UserMenu)
│   └── forms/          # Form components
├── pages/              # Page components (Next.js style)
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Login.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── ...
├── services/           # API services and data fetching
│   ├── api.ts          # Base API client
│   ├── auth.ts         # Authentication service
│   ├── tasks.ts        # Tasks service
│   └── mockData.ts     # Mock data for development
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
└── constants/          # Application constants
```

## 🚀 Features

- **Clean Architecture**: Proper separation of concerns with services, hooks, and components
- **TypeScript**: Full type safety throughout the application
- **Material-UI**: Modern, accessible UI components with proper theming
- **React Query**: Efficient data fetching, caching, and synchronization
- **React Router**: Declarative routing with protected routes
- **Mock Data**: Development-friendly mock API for testing
- **Responsive Design**: Mobile-first responsive layout
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Technology Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Material-UI v7** - Modern React UI framework
- **React Query (TanStack Query)** - Powerful data synchronization
- **React Router v6** - Declarative routing
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API requests

## 📦 Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Type checking
yarn typecheck

# Linting
yarn lint

# Format code
yarn format
```

## 🔧 Development

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_USE_MOCK_DATA=true
```

### Mock Data

The application uses mock data by default for development. Set `VITE_USE_MOCK_DATA=false` to use real API endpoints.

**Demo Credentials:**

- Email: `admin@gogotime.com`
- Password: `admin123`

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Update the sidebar navigation in `src/components/layout/Sidebar.tsx`

### Adding New API Services

1. Create service functions in `src/services/`
2. Create corresponding React Query hooks in `src/hooks/`
3. Add TypeScript types in `src/types/`

## 🎨 UI Components

### Basic Components

- `LoadingSpinner` - Loading indicator with optional message
- `ErrorMessage` - Error display with different severity levels
- `PageHeader` - Consistent page headers with breadcrumbs and actions

### Layout Components

- `AppLayout` - Main application layout with sidebar and header
- `Sidebar` - Navigation sidebar with role-based menu items
- `UserMenu` - User profile dropdown menu

## 🔐 Authentication

The application uses JWT-based authentication with:

- Protected routes that redirect to login
- Automatic token refresh
- Role-based access control
- Persistent login state

## 📱 Responsive Design

The application is fully responsive with:

- Mobile-first design approach
- Collapsible sidebar on mobile devices
- Responsive data grids and forms
- Touch-friendly interface elements

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

## 📈 Performance

- **Code Splitting**: Automatic route-based code splitting
- **React Query**: Intelligent caching and background updates
- **Optimized Builds**: Tree shaking and minification
- **Lazy Loading**: Components loaded on demand

## 🔍 Code Quality

- **ESLint**: Strict linting rules for code quality
- **Prettier**: Consistent code formatting
- **TypeScript**: Compile-time type checking
- **Husky**: Pre-commit hooks for quality gates

## 🚀 Deployment

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📝 Contributing

1. Follow the established architecture patterns
2. Write TypeScript with proper types
3. Use React Query for all data fetching
4. Follow Material-UI design principles
5. Write tests for new features
6. Run linting and formatting before commits

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**: Run `yarn typecheck` to identify TypeScript issues
2. **API Errors**: Check if `VITE_USE_MOCK_DATA=true` for development
3. **Styling Issues**: Ensure Material-UI theme is properly configured
4. **Route Issues**: Verify routes are properly defined in `App.tsx`

### Performance Issues

1. Check React Query DevTools for unnecessary requests
2. Use React DevTools Profiler to identify slow components
3. Ensure proper memoization for expensive calculations
