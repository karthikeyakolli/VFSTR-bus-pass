-- VFSTR Smart Transport Management System (STMS) Relational Database Schema
-- Production-Ready Normalized PostgreSQL Schema for University Deployment

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'admin', 'superadmin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE pass_status AS ENUM ('pending', 'approved', 'rejected', 'expired', 'active');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE request_type AS ENUM ('new_pass', 'renewal', 'route_change', 'cancellation');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'unpaid', 'pending_verification', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('pass', 'route', 'payment', 'announcement', 'system');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- 2. ACADEMIC DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 3. STUDENTS TABLE (Core Student Entity)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    academic_year VARCHAR(30) NOT NULL,
    section VARCHAR(10),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 4. TRANSPORT PROFILES TABLE (1-to-1 with Student)
CREATE TABLE IF NOT EXISTS public.transport_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(150),
    address TEXT,
    preferred_pickup_point VARCHAR(150),
    is_transport_user BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 5. BUSES TABLE
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(50) UNIQUE NOT NULL,
    registration_no VARCHAR(50) UNIQUE NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    driver_name VARCHAR(150),
    driver_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 6. ROUTES TABLE (1 Route has Many Stops)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_number VARCHAR(50) UNIQUE NOT NULL,
    route_name VARCHAR(150) NOT NULL,
    assigned_bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
    total_seats INT DEFAULT 60,
    occupied_seats INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 7. ROUTE STOPS TABLE
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(150) NOT NULL,
    pickup_time TIME,
    drop_time TIME,
    stop_order INT NOT NULL,
    distance_km NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT unique_route_stop_order UNIQUE (route_id, stop_order)
);


-- 8. FEES TABLE (Route & Distance Tier Based Transport Fees)
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
    academic_year VARCHAR(30) NOT NULL,
    annual_fee NUMERIC(10, 2) NOT NULL,
    term_fee NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    CONSTRAINT unique_route_fee_per_year UNIQUE (route_id, academic_year)
);


-- 9. BUS PASSES TABLE (1 Active Pass per Student constraint)
CREATE TABLE IF NOT EXISTS public.bus_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id),
    stop_id UUID REFERENCES public.route_stops(id),
    pickup_point VARCHAR(150) NOT NULL,
    academic_year VARCHAR(30) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    status pass_status DEFAULT 'pending',
    fee_amount NUMERIC(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'unpaid',
    authorized_by VARCHAR(150),
    qr_code_hash TEXT,
    is_active BOOLEAN GENERATED ALWAYS AS (status = 'active') STORED,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Constraint: Ensure only ONE active bus pass per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_pass_per_student 
ON public.bus_passes(student_id) 
WHERE status = 'active' AND deleted_at IS NULL;


-- 10. TRANSPORT REQUESTS TABLE (1 Student can have Many Requests)
CREATE TABLE IF NOT EXISTS public.transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    request_type request_type NOT NULL,
    route_id UUID REFERENCES public.routes(id),
    stop_id UUID REFERENCES public.route_stops(id),
    pickup_point VARCHAR(150) NOT NULL,
    status pass_status DEFAULT 'pending',
    remarks TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 11. PAYMENTS TABLE (1 Student can have Many Payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    pass_id UUID REFERENCES public.bus_passes(id) ON DELETE SET NULL,
    request_id UUID REFERENCES public.transport_requests(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    receipt_url TEXT,
    status payment_status DEFAULT 'pending_verification',
    bank_reference_no VARCHAR(100),
    paid_at TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- NULL for broad announcement
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    full_message TEXT,
    notification_type notification_type DEFAULT 'system',
    category VARCHAR(50) DEFAULT 'General',
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 13. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status ticket_status DEFAULT 'open',
    response TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);


-- 14. AUDIT LOGS TABLE (For Security, Administrative Traceability & System Auditing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- 15. PERFORMANCE & SEARCH INDEXES
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON public.students(reg_no) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transport_profiles_student ON public.transport_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_order ON public.route_stops(route_id, stop_order);
CREATE INDEX IF NOT EXISTS idx_bus_passes_student ON public.bus_passes(student_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bus_passes_status ON public.bus_passes(status);
CREATE INDEX IF NOT EXISTS idx_transport_requests_student ON public.transport_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student ON public.notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);


-- 16. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own profile" ON public.students FOR SELECT USING (user_id = auth.uid() AND deleted_at IS NULL);
CREATE POLICY "Students view own transport profile" ON public.transport_profiles FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "Students view own passes" ON public.bus_passes FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "Students view own requests" ON public.transport_requests FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "Students view own payments" ON public.payments FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) AND deleted_at IS NULL);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read routes" ON public.routes FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read route stops" ON public.route_stops FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read fees" ON public.fees FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (deleted_at IS NULL);
