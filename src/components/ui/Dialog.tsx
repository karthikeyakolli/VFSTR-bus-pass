import React from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex min-h-full items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative my-auto w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/20',
          'z-10 animate-scale-in max-h-[90vh] overflow-y-auto text-card-foreground',
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {(title || description) && (
          <div className="flex flex-col space-y-1.5 text-left mb-5">
            {title && (
              <h2 className="text-xl font-black tracking-tight text-foreground font-heading pr-8">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}
          </div>
        )}

        <div className="py-1">{children}</div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 pt-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
