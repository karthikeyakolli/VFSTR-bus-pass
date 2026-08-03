import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Ticket, Bell, CreditCard, Clock, Route, FileText, Sparkles } from 'lucide-react';

export interface SystemStateProps {
  actionUrl?: string;
  className?: string;
}

export const NoPassState: React.FC<SystemStateProps> = ({ actionUrl = '/student/apply', className = '' }) => (
  <div className={`p-8 border-2 border-dashed border-primary/30 rounded-2xl bg-card text-center ${className}`}>
    <EmptyState
      icon={<Ticket className="h-12 w-12 text-primary" />}
      title="No Active Bus Pass Found"
      description="You have not registered for an annual transport pass for the current academic year."
      action={
        <Link to={actionUrl}>
          <Button variant="primary" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
            Apply for Bus Pass
          </Button>
        </Link>
      }
    />
  </div>
);

export const NoNotificationsState: React.FC<SystemStateProps> = ({ className = '' }) => (
  <div className={`p-8 border-2 border-dashed border-border rounded-2xl bg-card text-center ${className}`}>
    <EmptyState
      icon={<Bell className="h-12 w-12 text-muted-foreground/60" />}
      title="You're All Caught Up!"
      description="No unread transport notifications or urgent announcement alerts in your inbox."
      action={
        <Badge variant="outline" className="text-xs font-normal">
          <Sparkles className="h-3 w-3 text-amber-500 mr-1" /> Inbox Clear
        </Badge>
      }
    />
  </div>
);

export const NoPaymentsState: React.FC<SystemStateProps> = ({ actionUrl = '/student/apply', className = '' }) => (
  <div className={`p-8 border-2 border-dashed border-border rounded-2xl bg-card text-center ${className}`}>
    <EmptyState
      icon={<CreditCard className="h-12 w-12 text-muted-foreground/60" />}
      title="No Fee Clearance Records"
      description="Zero transport payment transactions found for your student registration number."
      action={
        <Link to={actionUrl}>
          <Button variant="outline" size="sm">
            Pay Annual Pass Fee
          </Button>
        </Link>
      }
    />
  </div>
);

export const NoActivityState: React.FC<SystemStateProps> = ({ className = '' }) => (
  <div className={`p-8 border-2 border-dashed border-border rounded-2xl bg-card text-center ${className}`}>
    <EmptyState
      icon={<Clock className="h-12 w-12 text-muted-foreground/60" />}
      title="No Recent Activity Log"
      description="Your transport activity log is currently clear. Recent transactions will appear here."
    />
  </div>
);

export const NoRouteAssignedState: React.FC<SystemStateProps> = ({ actionUrl = '/student/routes', className = '' }) => (
  <div className={`p-8 border-2 border-dashed border-border rounded-2xl bg-card text-center ${className}`}>
    <EmptyState
      icon={<Route className="h-12 w-12 text-muted-foreground/60" />}
      title="No Route Assigned Yet"
      description="Your boarding stop and bus route assignment are currently pending Transport Cell verification."
      action={
        <Link to={actionUrl}>
          <Button variant="outline" size="sm">
            Explore Campus Routes
          </Button>
        </Link>
      }
    />
  </div>
);
