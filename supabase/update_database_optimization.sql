-- VFSTR Database Performance Optimization & Structured System Audit Logging

-- 1. SYSTEM AUDIT EVENT ENUM
DO $$ BEGIN
    CREATE TYPE audit_event_type AS ENUM (
        'student_imported',
        'transport_assigned',
        'bus_pass_generated',
        'payment_recorded',
        'request_submitted',
        'request_updated',
        'profile_updated',
        'security_event'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ACTOR TYPE ENUM
DO $$ BEGIN
    CREATE TYPE audit_actor_type AS ENUM (
        'student',
        'admin',
        'system',
        'service_role'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. EXTEND AUDIT LOGS TABLE FOR STRUCTURED CENTRALIZED EVENT TRACKING
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS event_type audit_event_type DEFAULT 'system',
ADD COLUMN IF NOT EXISTS reference_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS module VARCHAR(50) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS actor_type audit_actor_type DEFAULT 'system',
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. PERFORMANCE COMPOSITE & COVERING INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_module ON public.audit_logs(event_type, module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ref_id ON public.audit_logs(reference_id);

-- Performance Indexes for Query Speedup across Foreign Keys
CREATE INDEX IF NOT EXISTS idx_transport_profiles_student_id ON public.transport_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_bus_passes_student_academic ON public.bus_passes(student_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_payments_student_paid_at ON public.payments(student_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_student_submitted ON public.transport_requests(student_id, submitted_at DESC);
