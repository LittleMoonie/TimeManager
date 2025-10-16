import { useMemo, useEffect, useState, ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import UnauthorizedPage from '@/pages/authentication/unauthorized';

export const PermissionProtectedRoute = ({
  children,
  requiredPermission,
}: {
  children: ReactNode;
  requiredPermission: string | undefined;
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const userPermissions = useMemo(() => new Set(user?.permissions ?? []), [user]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    if (requiredPermission && !userPermissions.has(requiredPermission)) {
      setShowUnauthorized(true);
      const timer = setTimeout(() => {
        navigate('/app', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, userPermissions, requiredPermission, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (showUnauthorized) {
    return <UnauthorizedPage />;
  }

  if (requiredPermission && !userPermissions.has(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
};

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (!user || !allowedRoles.includes(user.role?.name ?? ''))) {
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
