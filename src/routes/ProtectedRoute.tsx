import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { checkRoleAccess } from '@/config/rbac.config';

export interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, role, isLoading } = useAuth();

  // If session is still resolving, show subtle loader
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-xs font-semibold">Authorizing secure session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve current location in query string for post-login redirect
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  if (allowedRoles && !checkRoleAccess(role, allowedRoles)) {
    return (
      <Navigate
        to="/403"
        replace
        state={{
          requiredRoles: allowedRoles,
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};
