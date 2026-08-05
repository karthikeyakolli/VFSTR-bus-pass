-- VFSTR Transport Profile Lifecycle & Multi-Year Bus Pass History Schema Update

-- 1. BUS PASS LIFECYCLE STAGE ENUM
DO $$ BEGIN
    CREATE TYPE bus_pass_lifecycle_stage AS ENUM (
        'not_enrolled',
        'applied',
        'verification',
        'approved',
        'pass_generated',
        'active',
        'expired',
        'renewal',
        'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TRANSPORT TYPE ENUM
DO $$ BEGIN
    CREATE TYPE transport_type AS ENUM (
        'annual_bus_pass',
        'term_bus_pass',
        'faculty_staff_pass',
        'special_exam_pass'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. UPDATE BUS PASSES TABLE WITH LIFECYCLE FIELDS & ARCHIVAL STAGE
ALTER TABLE public.bus_passes
ADD COLUMN IF NOT EXISTS lifecycle_stage bus_pass_lifecycle_stage DEFAULT 'applied',
ADD COLUMN IF NOT EXISTS transport_type transport_type DEFAULT 'annual_bus_pass',
ADD COLUMN IF NOT EXISTS drop_point VARCHAR(150) DEFAULT 'VFSTR Vadlamudi Campus',
ADD COLUMN IF NOT EXISTS renewal_date DATE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- 4. HISTORICAL BUS PASS AUDIT TRAIL TABLE (Preserves multi-year transport journey)
CREATE TABLE IF NOT EXISTS public.bus_pass_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_pass_id UUID NOT NULL REFERENCES public.bus_passes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year VARCHAR(30) NOT NULL,
    route_id UUID REFERENCES public.routes(id),
    pickup_point VARCHAR(150) NOT NULL,
    drop_point VARCHAR(150) DEFAULT 'VFSTR Vadlamudi Campus',
    pass_number VARCHAR(50) NOT NULL,
    lifecycle_stage bus_pass_lifecycle_stage NOT NULL,
    fee_amount NUMERIC(10, 2) NOT NULL,
    payment_status payment_status NOT NULL,
    authorized_by VARCHAR(150),
    archived_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR MULTI-YEAR QUERIES
CREATE INDEX IF NOT EXISTS idx_bus_pass_history_student ON public.bus_pass_history(student_id);
CREATE INDEX IF NOT EXISTS idx_bus_pass_history_year ON public.bus_pass_history(academic_year);
CREATE INDEX IF NOT EXISTS idx_bus_passes_lifecycle ON public.bus_passes(lifecycle_stage);

-- RLS POLICIES FOR PASS HISTORY
ALTER TABLE public.bus_pass_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own pass history" ON public.bus_pass_history 
FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
