import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { CssBaseline } from '@mui/material';
import { AppThemeProvider } from '@/theme/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import HomePage from '@/pages/index';
import Login from '@/pages/login';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        {/* <Route path="tasks" element={<Tasks />} /> */}
        <Route path="timesheet" element={<div>Timesheet Page</div>} />
        {/* <Route path="people" element={<People />} /> */}
        <Route path="reports" element={<div>Reports Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="profile" element={<div>Profile Page</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </AppThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
