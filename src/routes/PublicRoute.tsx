import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Redirect authenticated students away from login/register to student portal
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
};
