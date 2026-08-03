import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Ticket, Route, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/types';

export const NotificationsPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();

  const togglePopover = () => setIsOpen(!isOpen);

  const getNotificationIcon = (type?: NotificationItem['type']) => {
    switch (type) {
      case 'pass':
        return <Ticket className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'route':
        return <Route className="h-4 w-4 text-blue-500 shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button with Animated Indicator */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePopover}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </Button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop Click Dismissal */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
            {/* Popover Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0.5">
                    {unreadCount} New
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground">No notifications</p>
                  <p>You’re all caught up with campus transport updates.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-muted/50 ${
                      !item.read ? 'bg-primary/5 font-semibold' : 'bg-transparent'
                    }`}
                  >
                    {getNotificationIcon(item.type)}
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-normal leading-tight">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer Link to Full Notifications Page */}
            <div className="p-2.5 text-center border-t border-border bg-muted/20">
              <Link
                to="/student/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 py-1"
              >
                <span>View All Notifications Page</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
