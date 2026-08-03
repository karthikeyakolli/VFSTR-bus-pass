import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 max-w-lg mx-auto text-center">
      <Card className="p-8 border-2 border-rose-500/20 bg-card space-y-6 shadow-md w-full">
        {/* Vector Icon Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border-2 border-rose-500/20 shadow-sm">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <Badge variant="destructive" className="font-mono text-xs">
            ERROR 403 • ACCESS RESTRICTED
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Unauthorized Access
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            You do not have administrative permissions to view this portal area. This section is restricted to authorized VFSTR Transport Officers.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-foreground flex items-center justify-center gap-1.5">
            <UserCheck className="h-4 w-4 text-primary" /> Active Session: {user?.email || 'Student Account'}
          </p>
          <p className="text-[11px]">Role: <strong className="uppercase text-foreground">{user?.role || 'student'}</strong></p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Link to="/student" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<Home className="h-3.5 w-3.5" />}
            >
              Return to Student Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
