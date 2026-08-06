-- VFSTR Advanced Backend Capabilities & Infrastructure Upgrade
-- 1. Real-Time Bus GPS Tracking Schema
-- 2. Offline Cryptographic Verification & HMAC Pass Signatures
-- 3. Installment Payment Tracking Schema
-- 4. Multi-Campus Organization Architecture
-- 5. Automated System Triggers & Status History

-- ============================================================================
-- 1. REAL-TIME BUS GPS TRACKING & LOCATION LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bus_gps_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0,
    heading NUMERIC(5, 2) DEFAULT 0,
    battery_level INT DEFAULT 100,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bus_gps_bus_recorded ON public.bus_gps_logs(bus_id, recorded_at DESC);

-- Enable Realtime on GPS logs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_gps_logs;

-- ============================================================================
-- 2. CRYPTOGRAPHIC HMACS & VERIFICATION AUDIT TRAIL
-- ============================================================================
ALTER TABLE public.bus_passes 
ADD COLUMN IF NOT EXISTS qr_signature TEXT,
ADD COLUMN IF NOT EXISTS security_hash VARCHAR(64);

CREATE TABLE IF NOT EXISTS public.pass_verification_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_id UUID NOT NULL REFERENCES public.bus_passes(id) ON DELETE CASCADE,
    scanned_by_user_id UUID REFERENCES auth.users(id),
    conductor_name VARCHAR(150),
    bus_id UUID REFERENCES public.buses(id),
    verification_status VARCHAR(50) NOT NULL, -- 'verified', 'invalid_signature', 'expired', 'revoked'
    device_info TEXT,
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    scanned_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. INSTALLMENT PAYMENT PLAN & TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    route_fee_id UUID REFERENCES public.route_fees(id),
    installment_number INT NOT NULL DEFAULT 1,
    total_installments INT NOT NULL DEFAULT 2,
    amount_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'partially_paid'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Function to auto-flag overdue installments
CREATE OR REPLACE FUNCTION public.check_overdue_installments()
RETURNS VOID AS $$
BEGIN
    UPDATE public.payment_installments
    SET payment_status = 'overdue',
        updated_at = now()
    WHERE due_date < CURRENT_DATE 
      AND payment_status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. MULTI-CAMPUS / MULTI-BRANCH ORGANIZATION ARCHITECTURE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location_city VARCHAR(100) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Default VFSTR Campuses
INSERT INTO public.campuses (code, name, location_city, address)
VALUES 
    ('VFSTR_VAD', 'Vadlamudi Main Campus', 'Guntur', 'Vadlamudi, Chebrolu Mandal, Guntur, AP - 522213'),
    ('VFSTR_VJA', 'Vijayawada Satellite Center', 'Vijayawada', 'M.G. Road, Vijayawada, AP - 520010')
ON CONFLICT (code) DO NOTHING;

-- Link buses & routes to campus
ALTER TABLE public.routes 
ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES public.campuses(id);

ALTER TABLE public.buses 
ADD COLUMN IF NOT EXISTS campus_id UUID REFERENCES public.campuses(id);

-- ============================================================================
-- 5. AUTOMATED STATUS NOTIFICATION & AUDIT LOG TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_notify_pass_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.notifications (
            id,
            user_id,
            title,
            message,
            category,
            priority,
            created_at
        )
        SELECT 
            gen_random_uuid(),
            s.user_id,
            'Bus Pass Status Update: ' || UPPER(NEW.status),
            'Your VFSTR bus pass (' || NEW.pass_number || ') status has been updated to ' || UPPER(NEW.status) || '.',
            'pass',
            'high',
            now()
        FROM public.students s
        WHERE s.id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bus_pass_status_notify ON public.bus_passes;
CREATE TRIGGER trg_bus_pass_status_notify
AFTER UPDATE ON public.bus_passes
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_pass_status_change();
