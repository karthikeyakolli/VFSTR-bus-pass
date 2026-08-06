import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const getInitials = (n?: string) => {
    if (!n) return '';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
  };

  const statusRings = {
    online: 'shadow-emerald-400/50',
    offline: '',
    busy: 'shadow-rose-400/50',
  };

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full border-2 border-border/60 bg-gradient-to-br from-primary/15 to-primary/5 items-center justify-center font-bold text-primary select-none transition-all duration-200',
          'hover:border-primary/40 hover:shadow-md',
          status && statusRings[status],
          sizeStyles[size],
          className
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : name ? (
          <span className="font-black tracking-tight">{getInitials(name)}</span>
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-2.5 w-2.5',
            size === 'lg' && 'h-3 w-3',
            size === 'xl' && 'h-4 w-4',
            statusColors[status],
            status === 'online' && 'animate-pulse'
          )}
        />
      )}
    </div>
  );
};
