-- VFSTR Transport Request Workflow Engine Extension

-- 1. EXPAND REQUEST TYPE ENUM
DO $$ BEGIN
    CREATE TYPE transport_request_type AS ENUM (
        'new_enrollment',
        'route_change',
        'pickup_stop_change',
        'drop_stop_change',
        'transport_cancellation',
        'bus_pass_renewal',
        'general_transport_query'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. EXPAND REQUEST WORKFLOW STAGE ENUM
DO $$ BEGIN
    CREATE TYPE request_workflow_stage AS ENUM (
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'completed',
        'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. EXTEND TRANSPORT REQUESTS TABLE WITH WORKFLOW & DOCUMENT ATTACHMENTS
ALTER TABLE public.transport_requests
ADD COLUMN IF NOT EXISTS workflow_type transport_request_type DEFAULT 'new_enrollment',
ADD COLUMN IF NOT EXISTS workflow_stage request_workflow_stage DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS supporting_documents_url TEXT,
ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 4. REQUEST HISTORY AUDIT TRAIL TABLE (Preserves status changes over time)
CREATE TABLE IF NOT EXISTS public.request_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.transport_requests(id) ON DELETE CASCADE,
    previous_stage request_workflow_stage,
    new_stage request_workflow_stage NOT NULL,
    remarks TEXT,
    changed_by VARCHAR(150),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR WORKFLOW LOOKUPS & HISTORY
CREATE INDEX IF NOT EXISTS idx_requests_stage ON public.transport_requests(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_request_history_req ON public.request_status_history(request_id);

-- RLS FOR REQUEST HISTORY
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own request history" ON public.request_status_history
FOR SELECT USING (request_id IN (SELECT id FROM public.transport_requests WHERE student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())));
