import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-5',
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          {/* Accent bar */}
          <span className="hidden sm:block w-1 h-5 rounded-full bg-primary shrink-0" aria-hidden />
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground font-heading">
            {title}
          </h2>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-relaxed sm:ml-4">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};
