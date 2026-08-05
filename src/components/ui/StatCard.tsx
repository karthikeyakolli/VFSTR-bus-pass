import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';


export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  progress?: number;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  progress,
  className,
}) => {
  return (
    <Card className={cn('p-5 flex flex-col justify-between gap-3 border-2 border-border/80 bg-card hover:border-primary/30 transition-all duration-200 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-foreground">{value}</span>
        {trend && (
          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {trend.value}
          </span>
        )}
      </div>

      {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}

      {progress !== undefined && (
        <div className="w-full bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </Card>
  );
};
