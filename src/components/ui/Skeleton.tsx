import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-lg',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={cn(
        'skeleton-shimmer',
        variantStyles[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
};
