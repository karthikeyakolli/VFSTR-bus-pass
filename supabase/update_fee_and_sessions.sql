-- VFSTR Fee System & Academic Session Window Extension

-- 1. PAYMENT GATEWAY ENUM (Offline Cash, Challan, Bank Transfer + Future Razorpay)
DO $$ BEGIN
    CREATE TYPE payment_gateway AS ENUM ('offline_challan', 'offline_cash', 'net_banking', 'upi', 'razorpay');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ACADEMIC SESSIONS & WINDOWS TABLE
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year VARCHAR(30) UNIQUE NOT NULL, -- e.g. '2026-2027'
    is_current BOOLEAN DEFAULT false,
    application_window_start DATE NOT NULL,
    application_window_end DATE NOT NULL,
    renewal_window_start DATE NOT NULL,
    renewal_window_end DATE NOT NULL,
    renewal_deadline DATE NOT NULL,
    late_fee_amount NUMERIC(10, 2) DEFAULT 500.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. EXTEND FEES TABLE FOR REVISIONS, INSTALLMENTS & STATUS
ALTER TABLE public.fees
ADD COLUMN IF NOT EXISTS fee_category VARCHAR(50) DEFAULT 'Standard Distance Tier',
ADD COLUMN IF NOT EXISTS allow_installments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS installment_terms INT DEFAULT 2,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;

-- 4. EXTEND PAYMENTS TABLE FOR GATEWAY INTEGRATION & RAZORPAY PLACEHOLDERS
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS payment_gateway payment_gateway DEFAULT 'offline_challan',
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);

-- INDEX FOR ACTIVE ACADEMIC SESSION LOOKUPS
CREATE INDEX IF NOT EXISTS idx_academic_sessions_current ON public.academic_sessions(is_current);
