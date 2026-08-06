import React from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-card text-foreground border-border',
      info: 'bg-blue-50/80 text-blue-900 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800/50',
      success: 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/50',
      warning: 'bg-amber-50/80 text-amber-900 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/50',
      destructive: 'bg-rose-50/80 text-rose-900 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-800/50',
    };

    const leftBorders = {
      default: '',
      info: 'border-l-4 border-l-blue-500',
      success: 'border-l-4 border-l-emerald-500',
      warning: 'border-l-4 border-l-amber-500',
      destructive: 'border-l-4 border-l-rose-500',
    };

    const iconBgs = {
      default: '',
      info: 'bg-blue-100 dark:bg-blue-900/40',
      success: 'bg-emerald-100 dark:bg-emerald-900/40',
      warning: 'bg-amber-100 dark:bg-amber-900/40',
      destructive: 'bg-rose-100 dark:bg-rose-900/40',
    };

    const icons = {
      default: null,
      info: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      success: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      warning: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      destructive: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    };

    const icon = icons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative w-full rounded-2xl border p-4 flex gap-3 text-sm transition-all animate-fade-up',
          variants[variant],
          leftBorders[variant],
          className
        )}
        {...props}
      >
        {icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconBgs[variant])}>
            {icon}
          </span>
        )}
        <div className="flex-1 flex flex-col gap-1">{children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('font-bold leading-none tracking-tight text-sm', className)} {...props} />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-xs leading-relaxed opacity-90 [&_p]:leading-relaxed', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';
