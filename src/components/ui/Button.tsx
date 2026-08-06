import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

    const variants = {
      primary:
        'bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] shadow-md hover:shadow-lg hover:shadow-primary/20 active:shadow-sm',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg hover:shadow-secondary/20 active:shadow-sm',
      outline:
        'border border-border bg-card text-foreground hover:bg-accent/60 hover:text-accent-foreground hover:border-primary/40 shadow-2xs',
      ghost: 'text-foreground hover:bg-accent/60 hover:text-accent-foreground',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:shadow-destructive/20 active:shadow-sm',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-xs sm:text-sm gap-2',
      lg: 'h-11 px-5 text-sm sm:text-base gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
