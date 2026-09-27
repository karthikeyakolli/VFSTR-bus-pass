import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  UserCheck,
  Zap,
  LogIn,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Bus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ROLE_METADATA } from '@/config/rbac.config';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, switchRole, portalPath } = useAuth();
  const [isSwitching, setIsSwitching] = useState(false);

  // Extract navigation state passed from ProtectedRoute
  const navState = (location.state as { requiredRoles?: UserRole[]; from?: string }) || {};
  const requiredRoles = navState.requiredRoles || ['admin'];
  const targetRole = requiredRoles[0] || 'admin';
  const targetMeta = ROLE_METADATA[targetRole];

  const handleQuickSwitch = async () => {
    setIsSwitching(true);
    await switchRole(targetRole);
    setIsSwitching(false);
    if (navState.from) {
      navigate(navState.from, { replace: true });
    } else if (targetMeta?.defaultPath) {
      navigate(targetMeta.defaultPath, { replace: true });
    }
  };

  const getRoleIcon = (r?: UserRole | null) => {
    switch (r) {
      case 'student':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'faculty':
        return <Briefcase className="h-4 w-4 text-emerald-500" />;
      case 'driver':
        return <Bus className="h-4 w-4 text-amber-500" />;
      case 'admin':
      case 'superadmin':
        return <ShieldCheck className="h-4 w-4 text-rose-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 max-w-xl mx-auto text-center animate-page">
      <Card className="p-8 border-2 border-rose-500/25 bg-card space-y-6 shadow-xl w-full rounded-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Vector Icon Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border-2 border-rose-500/20 shadow-inner">
          <ShieldAlert className="h-10 w-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <Badge variant="destructive" className="font-mono text-xs px-3 py-1">
            ERROR 403 • ACCESS RESTRICTED
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Restricted Permission Area
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Your current account credentials do not grant access to this portal sector.
            {requiredRoles.length > 0 && (
              <span className="block mt-1.5 font-medium text-foreground">
                Required Role:{' '}
                <strong className="text-rose-600 dark:text-rose-400 uppercase">
                  {requiredRoles.join(' or ')}
                </strong>
              </span>
            )}
          </p>
        </div>

        {/* Current Active Session Card */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/80 text-xs text-muted-foreground space-y-2 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Session
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-full bg-background border border-border text-[11px] capitalize text-foreground">
              {getRoleIcon(role)}
              {role || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-foreground">{user?.name || 'Authorized Member'}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{user?.email || 'N/A'}</span>
          </div>
        </div>

        {/* Fast-Track Role Switcher for Testing / Demonstration */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-foreground">Prototype Quick Switch</span>
            </div>
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-600 dark:text-amber-400">
              Evaluator Tool
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Instantly switch your session persona to <strong className="text-foreground capitalize">{targetRole}</strong> to access this view:
          </p>
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-sm"
            leftIcon={<Zap className="h-3.5 w-3.5" />}
            isLoading={isSwitching}
            onClick={handleQuickSwitch}
          >
            Switch to {targetMeta?.title || targetRole.toUpperCase()} & Proceed
          </Button>
        </div>

        {/* Standard Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Link to={portalPath} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<Home className="h-3.5 w-3.5" />}
            >
              My Dashboard
            </Button>
          </Link>

          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs"
              leftIcon={<LogIn className="h-3.5 w-3.5" />}
            >
              Sign In Different Role
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
