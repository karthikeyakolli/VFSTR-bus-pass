import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, disabled, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex min-h-[100px] w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm',
            'placeholder:text-muted-foreground/60 ring-offset-background',
            'transition-all duration-200 ease-out',
            'hover:border-primary/40',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1 focus-visible:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/40',
            'resize-y',
            error
              ? 'border-l-4 border-l-destructive border-destructive/50 focus-visible:ring-destructive/30'
              : '',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
