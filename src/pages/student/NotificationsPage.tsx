import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog } from '@/components/ui/Dialog';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import { NotificationItem } from '@/types';
import {
  Bell,
  CheckCheck,
  Search,
  Bus,
  CreditCard,
  FileCheck,
  Megaphone,
  Clock,
  Eye,
  RefreshCw,
} from 'lucide-react';

type NotificationCategory = 'All' | 'Renewals' | 'Announcements' | 'Payment Updates' | 'Application Updates' | 'Transport Notices';

export interface DetailedNotificationItem extends NotificationItem {
  category: 'Renewals' | 'Announcements' | 'Payment Updates' | 'Application Updates' | 'Transport Notices';
  fullMessage: string;
  actionUrl?: string;
  sender: string;
}

export const NotificationsPage: React.FC = () => {
  const { unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<DetailedNotificationItem | null>(null);

  const mockDetailedNotifications: DetailedNotificationItem[] = [
    {
      id: '1',
      title: 'Digital Bus Pass Issued for Route #14',
      message: 'Your annual bus pass for Route #14 (Guntur City Express) has been approved by the Transport Cell.',
      fullMessage: 'Your annual bus pass for Route #14 (Guntur City Express) has been approved by Dr. M. R. K. Murthy. You can now present your digital pass or QR code directly on your smartphone to the bus conductor upon boarding.',
      time: '10 mins ago',
      read: false,
      type: 'pass',
      category: 'Application Updates',
      sender: 'VFSTR Transport Cell',
      actionUrl: '/student/pass',
    },
    {
      id: '2',
      title: 'Morning Pickup Schedule Adjustment',
      message: 'Morning pickup time for Guntur City Route #8 moved 5 mins earlier starting next Monday.',
      fullMessage: 'Due to road widening work on Guntur-Vadlamudi Highway, the morning pickup time for Route #8 (Collectorate Stop) has been shifted 5 minutes earlier to 07:05 AM starting Monday.',
      time: '1 hour ago',
      read: false,
      type: 'route',
      category: 'Transport Notices',
      sender: 'Traffic Operations Office',
    },
    {
      id: '3',
      title: 'Annual Fee Payment Verified (₹18,500)',
      message: 'Online transaction ₹18,500 successfully verified by VFSTR Accounts Desk.',
      fullMessage: 'Payment transaction ₹18,500 for Academic Year 2026-2027 has been verified by the VFSTR Cash Desk. Receipt PDF is available for download in your Payments section.',
      time: 'Yesterday, 04:30 PM',
      read: true,
      type: 'pass',
      category: 'Payment Updates',
      sender: 'VFSTR Accounts Cell',
      actionUrl: '/student/payments',
    },
    {
      id: '4',
      title: 'Early Bird Renewal Window Open for AY 2027-2028',
      message: 'Annual transport renewal window is now open for all senior students.',
      fullMessage: 'Beat the rush! The early bird renewal window for Academic Year 2027-2028 is now open. Submit your renewal request early to ensure guaranteed seat reservation on your preferred route.',
      time: '2 days ago',
      read: true,
      type: 'alert',
      category: 'Renewals',
      sender: 'Transport Cell Admin',
      actionUrl: '/student/renew',
    },
    {
      id: '5',
      title: 'Mid-Term Exam Special Bus Timings',
      message: 'Special afternoon buses will depart campus at 01:30 PM & 05:00 PM during exam week.',
      fullMessage: 'In view of mid-term examinations, special afternoon return buses will depart Vadlamudi campus at 01:30 PM in addition to the regular 05:00 PM evening schedule.',
      time: '3 days ago',
      read: true,
      type: 'alert',
      category: 'Announcements',
      sender: 'University Transport Committee',
    },
  ];

  const handleCategoryChange = (category: NotificationCategory) => {
    setIsLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const handleViewNotification = (item: DetailedNotificationItem) => {
    markAsRead(item.id);
    setSelectedNotification(item);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('Notifications Updated', 'All notifications marked as read.');
  };

  const filteredNotifications = mockDetailedNotifications.filter((n) => {
    const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sender.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Renewals':
        return <RefreshCw className="h-4 w-4 text-emerald-500" />;
      case 'Announcements':
        return <Megaphone className="h-4 w-4 text-amber-500" />;
      case 'Payment Updates':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'Application Updates':
        return <FileCheck className="h-4 w-4 text-primary" />;
      case 'Transport Notices':
        return <Bus className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-page">
      {/* Section Header */}
      <SectionHeader
        title="Campus Transport Notifications"
        subtitle="Stay updated on pass approvals, schedule changes, and announcements"
        badge={
          unreadCount > 0 ? (
            <Badge variant="destructive">{unreadCount} Unread</Badge>
          ) : (
            <Badge variant="success" dot>All Read</Badge>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
          </div>
        }
      />

      {/* Category Tabs & Search Bar */}
      <Card className="p-4 border-2 border-border bg-card">
        <div className="space-y-3">
          {/* Search Bar */}
          <Input
            placeholder="Search notifications by title, content, or sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="h-10 text-xs"
          />

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {(['All', 'Renewals', 'Announcements', 'Payment Updates', 'Application Updates', 'Transport Notices'] as NotificationCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-sm font-bold'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat !== 'All' && getCategoryIcon(cat)}
                  <span>{cat}</span>
                </button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Notification List Content */}
      <Card className="p-6 border-2 border-border bg-card">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title="No Notifications Found"
            description={
              searchQuery
                ? `No notifications matching "${searchQuery}" in ${activeCategory}.`
                : `No notifications in ${activeCategory} category.`
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset Category Filter
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleViewNotification(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.read
                    ? 'border-primary/40 bg-primary/5 shadow-sm font-semibold'
                    : 'border-border/60 bg-card hover:bg-muted/30 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {item.category}
                      </Badge>
                      {!item.read && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.time}
                      </span>
                      <span>•</span>
                      <span>From: {item.sender}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 justify-end">
                  <Button variant="ghost" size="sm" className="text-xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Detailed Notification Modal Dialog */}
      {selectedNotification && (
        <Dialog
          isOpen={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          title={selectedNotification.title}
          description={`Sent by ${selectedNotification.sender} • ${selectedNotification.time}`}
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-bold">
                {selectedNotification.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{selectedNotification.time}</span>
            </div>

            <p className="text-xs text-foreground leading-relaxed p-4 rounded-xl bg-muted/40 border border-border">
              {selectedNotification.fullMessage}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedNotification.actionUrl && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedNotification(null);
                    navigate(selectedNotification.actionUrl!);
                  }}
                >
                  Open Related Page
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
