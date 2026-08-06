import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, placeholder, id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full group">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full appearance-none rounded-xl border border-input bg-card px-3 py-2 pr-10 text-sm',
              'ring-offset-background placeholder:text-muted-foreground/60',
              'transition-all duration-200 ease-out',
              'hover:border-primary/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 focus-visible:border-primary',
              'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/40',
              error
                ? 'border-l-4 border-l-destructive border-destructive/50 focus-visible:ring-destructive/30'
                : '',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
        </div>
        {error && (
          <span className="text-[11px] font-semibold text-destructive">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-muted-foreground leading-relaxed">{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
