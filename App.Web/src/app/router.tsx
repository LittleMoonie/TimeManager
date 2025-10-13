import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { BrowserRouter, Navigate, type RouteObject, useRoutes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/index';
import LoginPage from '@/pages/login';
import PeoplePage from '@/pages/people';
import ProfilePage from '@/pages/profile';
import ReportsPage from '@/pages/reports';
// import TasksPage from '@/pages/tasks'
import TimesheetPage from '@/pages/timesheet';

import ForgotPasswordPage from '@/pages/forgot-password';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      // { path: 'tasks', element: <TasksPage /> },
      { path: 'timesheet', element: <TimesheetPage /> },
      { path: 'people', element: <PeoplePage /> },
      { path: 'reports', element: <ReportsPage /> },
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
