import { DetailedNotificationItem } from '@/pages/student/NotificationsPage';
import { SystemNotificationRecord, NotificationCategory, NotificationPriority, NotificationState, NotificationDeliveryChannel } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const mockNotices: DetailedNotificationItem[] = [
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
    title: 'Annual Fee Payment Verified (₹29,900)',
    message: 'Online transaction ₹29,900 successfully verified by VFSTR Accounts Desk.',
    fullMessage: 'Payment transaction ₹29,900 for Academic Year 2026-2027 has been verified by the VFSTR Cash Desk. Receipt PDF is available for download in your Payments section.',
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

export class NoticeService {
  /**
   * Send / Dispatch a centralized system notification.
   */
  static async sendNotification(params: {
    studentId?: string;
    title: string;
    description: string;
    fullMessage?: string;
    category: NotificationCategory;
    priority?: NotificationPriority;
    deliveryChannel?: NotificationDeliveryChannel;
    expiryDate?: string;
    relatedModule?: string;
    targetAudience?: string;
    actionUrl?: string;
  }): Promise<{ success: boolean; notificationId?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true, notificationId: `notif_${Date.now()}` };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          student_id: params.studentId || null,
          title: params.title,
          message: params.description,
          full_message: params.fullMessage || params.description,
          notification_category: params.category,
          priority: params.priority || 'medium',
          state: 'unread',
          delivery_channel: params.deliveryChannel || 'in_app',
          related_module: params.relatedModule || 'transport',
          target_audience: params.targetAudience || 'all_students',
          expiry_date: params.expiryDate || null,
          action_url: params.actionUrl || null,
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error || !data) return { success: false };
      return { success: true, notificationId: data.id };
    } catch {
      return { success: false };
    }
  }

  /**
   * Retrieve centralized system notifications with category & priority filters.
   */
  static async getSystemNotifications(
    studentId?: string,
    filterCategory?: NotificationCategory
  ): Promise<SystemNotificationRecord[]> {
    if (!isSupabaseConfigured) {
      return mockNotices.map((n) => ({
        id: n.id,
        studentId,
        title: n.title,
        description: n.message,
        fullMessage: n.fullMessage,
        category: (n.category === 'Payment Updates' ? 'payment_reminder' : n.category === 'Renewals' ? 'renewal_reminder' : 'general_notice') as NotificationCategory,
        priority: 'medium',
        state: n.read ? 'read' : 'unread',
        deliveryChannel: 'in_app',
        createdDate: n.time,
        relatedModule: 'transport',
        targetAudience: 'all_students',
        actionUrl: n.actionUrl,
      }));
    }

    try {
      let query = supabase.from('notifications').select('*').order('published_at', { ascending: false });

      if (studentId) {
        query = query.or(`student_id.eq.${studentId},student_id.is.null`);
      }
      if (filterCategory) {
        query = query.eq('notification_category', filterCategory);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((n: any) => ({
        id: n.id,
        studentId: n.student_id || undefined,
        title: n.title,
        description: n.message,
        fullMessage: n.full_message || n.message,
        category: (n.notification_category || 'general_notice') as NotificationCategory,
        priority: (n.priority || 'medium') as NotificationPriority,
        state: (n.state || (n.is_read ? 'read' : 'unread')) as NotificationState,
        deliveryChannel: (n.delivery_channel || 'in_app') as NotificationDeliveryChannel,
        createdDate: new Date(n.published_at).toLocaleString(),
        expiryDate: n.expiry_date ? new Date(n.expiry_date).toLocaleDateString() : undefined,
        relatedModule: n.related_module || 'transport',
        targetAudience: n.target_audience || 'all_students',
        actionUrl: n.action_url || undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Transition notification state (unread -> read -> archived).
   */
  static async updateNotificationState(notificationId: string, newState: NotificationState): Promise<boolean> {
    if (!isSupabaseConfigured) {
      const match = mockNotices.find((n) => n.id === notificationId);
      if (match && newState === 'read') match.read = true;
      return true;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          state: newState,
          is_read: newState === 'read' || newState === 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Legacy backward-compatible campus notice provider.
   */
  static async getCampusNotices(category: string = 'All'): Promise<DetailedNotificationItem[]> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (category === 'All') return [...mockNotices];
      return mockNotices.filter((n) => n.category === category);
    }

    try {
      const records = await this.getSystemNotifications();
      if (records.length === 0) return [...mockNotices];

      return records.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.description,
        fullMessage: n.fullMessage || n.description,
        time: n.createdDate,
        read: n.state === 'read',
        type: n.priority === 'urgent' || n.priority === 'high' ? 'alert' : 'pass',
        category: (n.category === 'payment_reminder' ? 'Payment Updates' : n.category === 'renewal_reminder' ? 'Renewals' : n.category === 'request_update' ? 'Application Updates' : n.category === 'transport_announcement' ? 'Transport Notices' : 'Announcements') as any,
        sender: 'VFSTR Transport Cell',
        actionUrl: n.actionUrl,
      }));
    } catch {
      return [...mockNotices];
    }
  }

  /**
   * Legacy backward-compatible markNoticeAsRead.
   */
  static async markNoticeAsRead(noticeId: string): Promise<boolean> {
    return this.updateNotificationState(noticeId, 'read');
  }
}
