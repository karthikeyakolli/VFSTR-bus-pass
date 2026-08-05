-- Add Transport Eligibility & Enrollment Status Enums to PostgreSQL Schema
DO $$ BEGIN
    CREATE TYPE transport_eligibility AS ENUM ('transport_user', 'non_transport_user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transport_status AS ENUM (
        'not_enrolled',
        'application_submitted',
        'under_verification',
        'approved',
        'active',
        'renewal_required',
        'inactive'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Update students table with program & semester fields
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS program VARCHAR(100) DEFAULT 'B.Tech',
ADD COLUMN IF NOT EXISTS semester VARCHAR(20) DEFAULT 'I Semester';

-- Update transport_profiles table with eligibility & enrollment status
ALTER TABLE public.transport_profiles 
ADD COLUMN IF NOT EXISTS eligibility transport_eligibility DEFAULT 'non_transport_user',
ADD COLUMN IF NOT EXISTS status transport_status DEFAULT 'not_enrolled',
ADD COLUMN IF NOT EXISTS counsellor VARCHAR(150);
