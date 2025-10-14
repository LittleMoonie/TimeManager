import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/authentication/login';
import HomePage from '@/pages/index';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import CreateTimesheetPage from '@/pages/timesheet/CreateTimesheetPage';
import TimesheetDetailsPage from '@/pages/timesheet/TimesheetDetailsPage';
import TimesheetList from '@/pages/timesheet/TimesheetList';
import { AppThemeProvider } from '@/theme/ThemeProvider';

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

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role?.name ?? '')) {
    return <Navigate to="/" replace />;
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
        <Route path="timesheet" element={<TimesheetList />} />
        <Route path="timesheet/new" element={<CreateTimesheetPage />} />
        <Route path="timesheet/:id" element={<TimesheetDetailsPage />} />
        {/* <Route path="people" element={<People />} */}
        <Route path="reports" element={<div>Reports Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="profile" element={<div>Profile Page</div>} />
        <Route
          path="/manager-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
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
