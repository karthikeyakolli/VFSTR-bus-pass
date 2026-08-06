import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, isRequired, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between"
          >
            <span>{label}</span>
            {isRequired && (
              <span className="text-[10px] font-bold text-destructive tracking-normal normal-case">Required</span>
            )}
          </label>
        )}
        <div className="relative flex items-center w-full group">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm ring-offset-background',
              'placeholder:text-muted-foreground/60',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'transition-all duration-200 ease-out',
              'hover:border-primary/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/40',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-l-4 border-l-destructive border-destructive/50 focus-visible:ring-destructive/30'
                : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-[11px] font-semibold text-destructive flex items-center gap-1">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-muted-foreground leading-relaxed">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
