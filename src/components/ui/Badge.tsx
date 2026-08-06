import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none';

  const variants = {
    default:
      'border-transparent bg-primary text-primary-foreground hover:bg-primary/85 hover:scale-[1.03]',
    secondary:
      'border-transparent bg-secondary/15 text-secondary border-secondary/20 hover:bg-secondary/25 hover:scale-[1.03]',
    success:
      'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400',
    warning:
      'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400',
    destructive:
      'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-400',
    outline: 'text-foreground border-border bg-card/50',
  };

  const dotColors = {
    default: 'bg-primary-foreground',
    secondary: 'bg-secondary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-500',
    outline: 'bg-foreground',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        </span>
      )}
      {children}
    </div>
  );
};
