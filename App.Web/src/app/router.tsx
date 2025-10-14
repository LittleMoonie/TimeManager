import { Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import DashboardPage from '@/pages';
import ForgotPasswordPage from '@/pages/forgot-password';
import LoginPage from '@/pages/login';
import PeoplePage from '@/pages/people';
import ProfilePage from '@/pages/profile';
import ReportsPage from '@/pages/reports';
import TimesheetPage from '@/pages/timesheet';
import UnauthorizedPage from '@/pages/unauthorized';

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoleName = user?.role?.name;

  if (allowedRoles && (!userRoleName || !allowedRoles.includes(userRoleName))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Preparing login..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const routeConfig: RouteObject[] = [
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      // { path: 'tasks', element: <TasksPage /> },
      { path: 'timesheet', element: <TimesheetPage /> },
      { path: 'people', element: <PeoplePage /> },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];

const RoutesContainer = () => {
  const element = useRoutes(routeConfig);
  return element;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner message="Loading GoGoTime..." />}>
      <RoutesContainer />
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
