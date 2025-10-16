/* eslint-disable prettier/prettier */
import { Routes, Route, Navigate } from 'react-router-dom';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useMenu } from '@/hooks/useMenu';
import Shell from '@/layout/Shell';
import ForgotPassword from '@/pages/authentication/forgot-password';
import Login from '@/pages/authentication/login';
import { DashboardPage } from '@/pages/dashboard/Dashboard';
import Hub from '@/pages/Hub';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import ProfilePage from '@/pages/profile/ProfilePage';

import { loadComponentForRoute } from './componentLoader';
import { PermissionProtectedRoute, RoleProtectedRoute } from './ProtectedRoutes';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isUserLoading } = useAuth();

  if (isUserLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { menu, isLoading } = useMenu();

  if (isLoading) {
    return <LoadingSpinner message="Loading routes..." />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Shell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* Hub routes for each category */}
        <Route path="timesheet" element={<Hub categoryKey="timesheet" />} />
        <Route path="team" element={<Hub categoryKey="team" />} />
        <Route path="hr-payroll" element={<Hub categoryKey="hr-payroll" />} />
        <Route path="reports" element={<Hub categoryKey="analytics" />} />
        <Route path="admin" element={<Hub categoryKey="company-admin" />} />

        {/* Dynamic routes from menu */}
        {menu?.categories.flatMap((category) =>
          category.cards.map((card) => (
            <Route
              key={card.id}
              path={card.route.substring(1)} // remove leading '/'
              element={
                <PermissionProtectedRoute requiredPermission={card.requiredPermission}>
                  {loadComponentForRoute(card.route, card.title)}
                </PermissionProtectedRoute>
              }
            />
          )),
        )}

        {/* Other static routes */}
        <Route path="settings" element={<div>Settings Page</div>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route
          path="manager-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['manager', 'company_admin', 'project_code_admin']}>
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
};
