import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, disabled, checked, onChange, ...props }, ref) => {
    const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex items-center justify-between gap-4 cursor-pointer select-none group',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">{label}</span>}
            {description && <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>}
          </div>
        )}

        {/* Toggle Track */}
        <div className="relative inline-flex items-center shrink-0">
          <input
            id={switchId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          {/* Track */}
          <div className={cn(
            'h-6 w-11 rounded-full border-2 border-transparent',
            'bg-input peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'transition-all duration-250 ease-out',
            'group-hover:border-primary/20'
          )}>
            {/* Thumb */}
            <div className={cn(
              'absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm',
              'transition-all duration-250 ease-out',
              'peer-checked:translate-x-5 peer-checked:shadow-md',
            )} />
          </div>
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
