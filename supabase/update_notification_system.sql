-- VFSTR Centralized Notification System Extension

-- 1. NOTIFICATION CATEGORY / TYPE ENUM
DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM (
        'general_notice',
        'payment_reminder',
        'renewal_reminder',
        'request_update',
        'transport_announcement',
        'emergency_notice'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. NOTIFICATION PRIORITY ENUM
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. NOTIFICATION STATE ENUM
DO $$ BEGIN
    CREATE TYPE notification_state AS ENUM (
        'unread',
        'read',
        'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. DELIVERY CHANNEL ENUM
DO $$ BEGIN
    CREATE TYPE notification_delivery_channel AS ENUM (
        'in_app',
        'email',
        'sms',
        'push_notification'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. EXTEND NOTIFICATIONS TABLE WITH WORKFLOW & CHANNEL COLUMNS
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS notification_category notification_category DEFAULT 'general_notice',
ADD COLUMN IF NOT EXISTS priority notification_priority DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS state notification_state DEFAULT 'unread',
ADD COLUMN IF NOT EXISTS delivery_channel notification_delivery_channel DEFAULT 'in_app',
ADD COLUMN IF NOT EXISTS related_module VARCHAR(50) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS target_audience VARCHAR(100) DEFAULT 'all_students',
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ;

-- INDEXES FOR NOTIFICATION LOOKUPS
CREATE INDEX IF NOT EXISTS idx_notifications_state ON public.notifications(state);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(notification_category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
