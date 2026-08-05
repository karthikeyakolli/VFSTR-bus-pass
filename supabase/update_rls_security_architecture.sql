-- VFSTR Comprehensive Row Level Security (RLS) Authorization Architecture
-- Production Security Policy Script for Student Data Protection

-- 1. ENABLE RLS ON ALL TABLES CONTAINING STUDENT & AUDIT DATA
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_pass_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES TO PREVENT DUPLICATES
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
DROP POLICY IF EXISTS "Students update permitted profile fields" ON public.students;
DROP POLICY IF EXISTS "Students view own transport profile" ON public.transport_profiles;
DROP POLICY IF EXISTS "Students update own transport profile phone" ON public.transport_profiles;
DROP POLICY IF EXISTS "Students view own bus passes" ON public.bus_passes;
DROP POLICY IF EXISTS "Students view own bus pass history" ON public.bus_pass_history;
DROP POLICY IF EXISTS "Students view own transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Students create own transport requests" ON public.transport_requests;
DROP POLICY IF EXISTS "Students view own request history" ON public.request_status_history;
DROP POLICY IF EXISTS "Students view own payment history" ON public.payments;
DROP POLICY IF EXISTS "Students view targeted notifications" ON public.notifications;
DROP POLICY IF EXISTS "Students view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Students create own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Deny student access to audit logs" ON public.audit_logs;

-- 3. STUDENTS TABLE POLICIES
-- Students can only view their own core record
CREATE POLICY "Students view own profile" ON public.students
FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);

-- Students can update permitted profile fields (e.g. avatar_url)
CREATE POLICY "Students update permitted profile fields" ON public.students
FOR UPDATE USING (user_id = auth.uid() AND deleted_at IS NULL)
WITH CHECK (user_id = auth.uid());

-- 4. TRANSPORT PROFILES POLICIES
-- Students can view their own transport profile
CREATE POLICY "Students view own transport profile" ON public.transport_profiles
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
);

-- Students can update permitted transport profile fields (phone, emergency_contact, preferred_pickup_point)
CREATE POLICY "Students update own transport profile phone" ON public.transport_profiles
FOR UPDATE USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
)
WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 5. BUS PASSES POLICIES
-- Students can view only their own active and historical passes
CREATE POLICY "Students view own bus passes" ON public.bus_passes
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
);

-- Students CANNOT insert, update, or delete bus pass credentials directly (Strict Admin / Backend Only)

-- 6. BUS PASS HISTORY POLICIES
CREATE POLICY "Students view own bus pass history" ON public.bus_pass_history
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 7. TRANSPORT REQUESTS POLICIES
-- Students can view their own requests
CREATE POLICY "Students view own transport requests" ON public.transport_requests
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
);

-- Students can create new transport requests for themselves
CREATE POLICY "Students create own transport requests" ON public.transport_requests
FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 8. REQUEST STATUS HISTORY POLICIES
CREATE POLICY "Students view own request history" ON public.request_status_history
FOR SELECT USING (
  request_id IN (
    SELECT id FROM public.transport_requests 
    WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  )
);

-- 9. PAYMENTS POLICIES
-- Students can view their own payment history
CREATE POLICY "Students view own payment history" ON public.payments
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
);

-- Students CANNOT modify payment status or financial amounts directly

-- 10. NOTIFICATIONS POLICIES
-- Students view notifications targeted to them or broadcast to all
CREATE POLICY "Students view targeted notifications" ON public.notifications
FOR SELECT USING (
  (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL) OR student_id IS NULL)
  AND deleted_at IS NULL
);

-- 11. SUPPORT TICKETS POLICIES
CREATE POLICY "Students view own support tickets" ON public.support_tickets
FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
  AND deleted_at IS NULL
);

CREATE POLICY "Students create own support tickets" ON public.support_tickets
FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid() AND deleted_at IS NULL)
);

-- 12. AUDIT LOGS SECURITY
-- Audit logs are strictly reserved for service role / superadmin analysis
-- Students are DENIED all access by having no SELECT/INSERT policies enabled for student role
