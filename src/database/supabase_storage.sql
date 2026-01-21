-- Create a new storage bucket for company assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('company_assets', 'company_assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage

-- 1. Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'company_assets' );

-- 2. Allow authenticated users (Admins/Consultants) to upload/update
--    Ideally restrict this to just admins, but basic auth is a good start.
CREATE POLICY "Auth Upload Access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company_assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Auth Update Access"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company_assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Auth Delete Access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company_assets'
  AND auth.role() = 'authenticated'
);
