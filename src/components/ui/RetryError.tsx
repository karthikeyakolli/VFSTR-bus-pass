import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertOctagon, RotateCcw, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface RetryErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const RetryError: React.FC<RetryErrorProps> = ({
  title = 'Failed to Load Resource',
  message = 'An unexpected error occurred while fetching transport data. Please retry.',
  onRetry,
  isLoading = false,
  className = '',
}) => {
  return (
    <Card className={`p-6 border-2 border-destructive/20 bg-destructive/5 text-center space-y-4 ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-xs">
        <AlertOctagon className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={onRetry}
          >
            Retry Operation
          </Button>
        )}

        <Link to="/help">
          <Button variant="outline" size="sm" leftIcon={<HelpCircle className="h-3.5 w-3.5" />}>
            Help Center
          </Button>
        </Link>
      </div>
    </Card>
  );
};
