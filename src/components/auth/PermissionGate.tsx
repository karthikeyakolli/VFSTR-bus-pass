import React from 'react';
import { UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { Permission, hasPermission, checkRoleAccess } from '@/config/rbac.config';

export interface PermissionGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  permission?: Permission;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  allowedRoles,
  permission,
  fallback = null,
}) => {
  const { role } = useAuth();

  if (allowedRoles && !checkRoleAccess(role, allowedRoles)) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
