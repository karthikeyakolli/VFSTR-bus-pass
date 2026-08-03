import React from 'react';
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
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: 'border-l-emerald-500',
    error: 'border-l-rose-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-lg border border-border border-l-4 bg-card p-4 text-card-foreground shadow-lg transition-all animate-in slide-in-from-right-5',
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 flex flex-col gap-0.5">
        <h5 className="text-xs font-bold text-foreground">{toast.title}</h5>
        {toast.description && <p className="text-xs text-muted-foreground">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
