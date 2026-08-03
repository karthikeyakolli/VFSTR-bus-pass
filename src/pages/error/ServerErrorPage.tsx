import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AlertOctagon, RotateCcw, LifeBuoy } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export const ServerErrorPage: React.FC = () => {
  const toast = useToast();

  const handleRetry = () => {
    toast.info('System Check', 'Re-establishing connection with VFSTR Transport Server...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-lg mx-auto text-center">
      <Card className="p-8 border-2 border-amber-500/20 bg-card space-y-6 shadow-md w-full">
        {/* Vector Icon Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border-2 border-amber-500/20 shadow-sm">
          <AlertOctagon className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <Badge variant="warning" className="font-mono text-xs">
            ERROR 500 • SYSTEM EXCEPTION
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Server Connection Interrupted
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The VFSTR Transport Portal encountered an unexpected server response. Our technical team has been notified.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
          <p className="font-mono font-bold text-foreground">
            Error Diagnostic Ref: <span className="text-primary">ERR-500-SYS-98142</span>
          </p>
          <p className="text-[11px]">Timestamp: {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            onClick={handleRetry}
          >
            Retry Connection
          </Button>

          <Link to="/help" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<LifeBuoy className="h-3.5 w-3.5" />}
            >
              Report to Support
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
