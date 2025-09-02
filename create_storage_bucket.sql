-- =====================================================
-- Create Storage Bucket (Handle Existing Policies)
-- =====================================================
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket (only if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'unit-bucket',
  'unit-bucket', 
  true,  -- Make it public
  52428800,  -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Update existing bucket to be public (in case it was created as private)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'unit-bucket';

-- 3. Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- 4. Create storage policies for the bucket

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'unit-bucket');

-- Policy: Allow public access to view files
CREATE POLICY "Allow public access to files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'unit-bucket');

-- Policy: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'unit-bucket' AND (auth.uid() = owner OR auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )));

-- 5. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;

-- 6. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'unit-bucket';

-- 7. Show completion message
SELECT 'Storage bucket "unit-bucket" created/updated successfully!' as status;
