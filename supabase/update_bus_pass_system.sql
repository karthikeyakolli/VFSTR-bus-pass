-- VFSTR Bus Pass Lifecycle & Credential Generation Infrastructure

-- 1. PASS VERIFICATION STATE ENUM
DO $$ BEGIN
    CREATE TYPE pass_verification_state AS ENUM (
        'unverified',
        'accounts_verified',
        'officer_authorized',
        'revoked'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. EXTEND BUS PASSES TABLE WITH BUS PASS STATES & PRINTABLE PLACEHOLDERS
ALTER TABLE public.bus_passes
ADD COLUMN IF NOT EXISTS verification_state pass_verification_state DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS qr_payload_url TEXT,
ADD COLUMN IF NOT EXISTS pdf_pass_url TEXT,
ADD COLUMN IF NOT EXISTS printable_template_id VARCHAR(50) DEFAULT 'VFSTR_OFFICIAL_PASS_V1';

-- INDEX FOR VERIFICATION STATE LOOKUPS
CREATE INDEX IF NOT EXISTS idx_bus_passes_verification ON public.bus_passes(verification_state);
