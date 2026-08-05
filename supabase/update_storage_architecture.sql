-- VFSTR Supabase Storage Buckets & Policies Provisioning Script

-- 1. PROVISION STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 2MB Limit
  ('bus_passes', 'bus_passes', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/png']), -- 5MB Limit (Protected Signed URLs)
  ('receipts', 'receipts', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']), -- 10MB Limit (Protected Signed URLs)
  ('request_documents', 'request_documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']), -- 10MB Limit (Protected)
  ('route_documents', 'route_documents', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']), -- 10MB Public Route Maps
  ('notices', 'notices', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']) -- 10MB Public Notice Attachments
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. FILE UPLOAD AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS public.file_upload_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    version INT DEFAULT 1,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEX FOR FILE AUDIT TRAIL
CREATE INDEX IF NOT EXISTS idx_file_upload_history_user ON public.file_upload_history(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_upload_history_bucket ON public.file_upload_history(bucket_id);

-- 3. STORAGE RLS POLICIES FOR AVATARS BUCKET
CREATE POLICY "Public avatar read access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Students upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);
CREATE POLICY "Students update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- 4. STORAGE RLS POLICIES FOR PROTECTED RECEIPTS BUCKET
CREATE POLICY "Students read own receipts" ON storage.objects FOR SELECT USING (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Students upload receipts to own folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. STORAGE RLS POLICIES FOR PROTECTED REQUEST DOCUMENTS BUCKET
CREATE POLICY "Students read own request docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'request_documents' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Students upload request docs to own folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'request_documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. STORAGE RLS POLICIES FOR BUS PASSES BUCKET
CREATE POLICY "Students read own bus passes" ON storage.objects FOR SELECT USING (
  bucket_id = 'bus_passes' AND auth.uid()::text = (storage.foldername(name))[1]
);
