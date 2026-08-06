import React from 'react';
import { cn } from '@/lib/utils';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="h-8 w-8 text-muted-foreground/60" />,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-10 rounded-2xl',
        'border-2 border-dashed border-border/60 bg-muted/10',
        'animate-fade-up',
        className
      )}
    >
      {/* Gradient icon container */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/5 border border-border/60 shadow-sm mb-5 transition-transform duration-300 hover:scale-105">
        {icon}
      </div>
      <h3 className="text-base font-bold text-foreground font-heading">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
