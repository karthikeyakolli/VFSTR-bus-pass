import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RefreshControlProps {
  onRefresh?: () => Promise<void> | void;
  label?: string;
  className?: string;
}

export const RefreshControl: React.FC<RefreshControlProps> = ({
  onRefresh,
  label = 'Refresh Data',
  className = '',
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    try {
      await onRefresh?.();
    } finally {
      // Keep spinner for at least 600ms for visual feedback
      setTimeout(() => setIsSpinning(false), 600);
    }
  }, [isSpinning, onRefresh]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isSpinning}
      className={cn('gap-1.5', className)}
      leftIcon={
        <RefreshCw
          className={cn('h-3.5 w-3.5', isSpinning && 'animate-spin')}
        />
      }
    >
      {isSpinning ? 'Refreshing…' : label}
    </Button>
  );
};
