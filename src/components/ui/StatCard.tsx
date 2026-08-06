import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  href?: string;
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
    <Card
      className={cn(
        'p-5 flex flex-col justify-between gap-3 group',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/25 cursor-default',
        'transition-all duration-250 ease-out',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shrink-0 border border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-200">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-3xl font-black tracking-tight text-foreground font-heading">{value}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border',
              trend.isPositive !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50'
            )}
          >
            {trend.isPositive !== false
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />
            }
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}

      {progress !== undefined && (
        <div className="w-full bg-muted/60 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </Card>
  );
};
