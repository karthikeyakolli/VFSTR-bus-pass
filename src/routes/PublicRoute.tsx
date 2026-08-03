import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    // Redirect authenticated users away from login/register to dashboard
    return <Navigate to={role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return <Outlet />;
};
