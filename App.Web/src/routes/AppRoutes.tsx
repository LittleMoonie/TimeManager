import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/pages/authentication/login';
import HomePage from '@/pages/index';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import CreateTimesheetPage from '@/pages/timesheet/CreateTimesheetPage';
import TimesheetDetailsPage from '@/pages/timesheet/TimesheetDetailsPage';
import TimesheetList from '@/pages/timesheet/TimesheetList';
import TimesheetHub from '@/pages/TimesheetHub';
import UnauthorizedPage from '@/pages/authentication/unauthorized';
import ForgotPassword from '@/pages/authentication/forgot-password';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isUserLoading } = useAuth();

  if (isUserLoading) {
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
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="timesheet-hub" element={<TimesheetHub />} />
        {/* <Route path="tasks" element={<Tasks />} /> */}
        <Route path="timesheet" element={<TimesheetList />} />
        <Route path="timesheet/new" element={<CreateTimesheetPage />} />
        <Route path="timesheet/:id" element={<TimesheetDetailsPage />} />
        {/* <Route path="people" element={<People />} */}
        <Route path="reports" element={<div>Reports Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="profile" element={<div>Profile Page</div>} />
        <Route
          path="manager-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['MANAGER']}>
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={isAuthenticated ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};