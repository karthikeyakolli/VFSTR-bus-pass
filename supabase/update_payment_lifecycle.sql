-- VFSTR Payment Flow Lifecycle & Gateway Integration Infrastructure

-- 1. PAYMENT LIFECYCLE STAGE ENUM
DO $$ BEGIN
    CREATE TYPE payment_lifecycle_stage AS ENUM (
        'fee_generated',
        'pending',
        'payment_initiated',
        'payment_successful',
        'receipt_generated',
        'completed',
        'failed',
        'refunded'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. EXTEND PAYMENTS TABLE WITH RECEIPT NO, INSTALLMENTS & GATEWAY FIELDS
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS lifecycle_stage payment_lifecycle_stage DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_number INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_installments INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(30) DEFAULT '2026-2027';

-- INDEX FOR PAYMENT HISTORY LOOKUPS
CREATE INDEX IF NOT EXISTS idx_payments_lifecycle ON public.payments(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_number);
