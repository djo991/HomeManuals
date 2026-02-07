/* 
# Setup Storage for Property Images
1. Storage
  - Create a public bucket 'property-assets' for images.
2. Security
  - Enable public read access to images.
  - Allow authenticated users to upload/delete images.
*/

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-assets', 'property-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'property-assets' );

-- Policy: Allow authenticated users to upload
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-assets' );

-- Policy: Allow authenticated users to update/delete
CREATE POLICY "Auth Update Delete"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'property-assets' );

CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-assets' );