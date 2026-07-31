-- 07_storage.sql
-- Creates the required storage buckets in Supabase Storage

-- Ensure the 'media' bucket exists (used for hero images, journey, celebrities, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure the 'collections' bucket exists (used for legacy image uploads)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('collections', 'collections', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to media bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'media' );

-- Allow public read access to collections bucket
CREATE POLICY "Public Access Collections" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'collections' );

-- (Optional) If you want to allow authenticated users to upload directly from client:
-- CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id IN ('media', 'collections') AND auth.role() = 'authenticated' );
