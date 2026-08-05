import React from 'react';
import { cn } from '@/lib/utils';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('space-y-6 animate-page pb-8', className)}>
      {children}
    </div>
  );
};

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

export interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageSection: React.FC<PageSectionProps> = ({ children, className }) => {
  return <section className={cn('space-y-4', className)}>{children}</section>;
};

export interface PageGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 12;
  className?: string;
}

export const PageGrid: React.FC<PageGridProps> = ({ children, columns = 12, className }) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    12: 'grid-cols-1 lg:grid-cols-12',
  };

  return <div className={cn('grid gap-6', colStyles[columns], className)}>{children}</div>;
};

export const PageSupportSection: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('pt-4 border-t border-border/60 text-xs text-muted-foreground', className)}>
      {children}
    </div>
  );
};
