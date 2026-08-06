import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const configs = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/50',
      border: 'border-l-emerald-500',
      bar: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/50',
      border: 'border-l-rose-500',
      bar: 'bg-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800/50',
      border: 'border-l-amber-500',
      bar: 'bg-amber-500',
    },
    info: {
      icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/80 dark:border-blue-800/50',
      border: 'border-l-blue-500',
      bar: 'bg-blue-500',
    },
  };

  const config = configs[toast.type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 w-full max-w-sm rounded-2xl border border-border border-l-4 bg-card/95 backdrop-blur-sm p-4 text-card-foreground',
        'shadow-xl shadow-black/8',
        'animate-in slide-in-from-right-4 fade-in-0 duration-300',
        'overflow-hidden',
        config.border
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Countdown progress bar */}
      <div
        className={cn('absolute bottom-0 left-0 h-0.5 rounded-full animate-countdown', config.bar)}
        style={{ animationDuration: `${duration}ms` }}
      />

      {/* Icon with tinted bg */}
      <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border', config.iconBg)}>
        {config.icon}
      </div>

      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <h5 className="text-xs font-bold text-foreground leading-snug">{toast.title}</h5>
        {toast.description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">{toast.description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
