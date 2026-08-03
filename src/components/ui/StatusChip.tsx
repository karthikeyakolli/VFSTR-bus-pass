import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

export type StatusType = 'active' | 'pending' | 'expired' | 'verified' | 'rejected';

export interface StatusChipProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, defaultLabel: 'Active' },
    verified: { variant: 'success' as const, defaultLabel: 'Verified' },
    pending: { variant: 'warning' as const, defaultLabel: 'Pending Approval' },
    expired: { variant: 'destructive' as const, defaultLabel: 'Expired' },
    rejected: { variant: 'destructive' as const, defaultLabel: 'Rejected' },
  };

  const config = statusConfig[status] || { variant: 'outline' as const, defaultLabel: status };

  return (
    <Badge variant={config.variant} dot className={cn('capitalize', className)}>
      {label || config.defaultLabel}
    </Badge>
  );
};
