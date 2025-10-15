import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import ForgotPassword from '@/pages/authentication/forgot-password';
import Login from '@/pages/authentication/login';
import UnauthorizedPage from '@/pages/authentication/unauthorized';
import HomePage from '@/pages/index';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import CreateTimesheetPage from '@/pages/timesheet/CreateTimesheetPage';
import TimesheetDetailsPage from '@/pages/timesheet/TimesheetDetailsPage';
import TimesheetList from '@/pages/timesheet/TimesheetList';
import TimesheetHub from '@/pages/TimesheetHub';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isUserLoading } = useAuth();
  console.warn(
    'ProtectedRoute (initial) - isAuthenticated:',
    isAuthenticated,
    'isUserLoading:',
    isUserLoading,
  );

  if (isUserLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Only proceed with authentication check once loading is complete
  if (!isUserLoading && !isAuthenticated) {
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
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    console.warn(
      'RoleProtectedRoute useEffect - isAuthenticated:',
      isAuthenticated,
      'user:',
      user?.role?.name,
      'allowedRoles:',
      allowedRoles,
    );
    if (!isLoading && isAuthenticated && (!user || !allowedRoles.includes(user.role?.name ?? ''))) {
      console.warn('RoleProtectedRoute: Redirecting to /app due to unauthorized role.');
      setShowUnauthorized(true);
      const timer = setTimeout(() => {
        navigate('/app', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (showUnauthorized) {
    return <UnauthorizedPage />;
  }

  if (!user || !allowedRoles.includes(user.role?.name ?? '')) {
    return null; // Or a loading spinner, as the redirect is handled by useEffect
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  console.warn('AppRoutes - isAuthenticated:', isAuthenticated);

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
            <RoleProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};
