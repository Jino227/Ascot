-- Run this in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('collections', 'collections', true, 10485760, '{"image/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 209715200, '{"image/*", "video/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view collection images" ON storage.objects;
CREATE POLICY "Public can view collection images"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('collections', 'media'));

DROP POLICY IF EXISTS "Authenticated users can upload collection images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload collection images" ON storage.objects;
CREATE POLICY "Auth users can upload to collections and media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('collections', 'media'));

DROP POLICY IF EXISTS "Owners can update their uploads" ON storage.objects;
CREATE POLICY "Owners can update their uploads" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner)
WITH CHECK (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner);

DROP POLICY IF EXISTS "Owners can delete their uploads" ON storage.objects;
CREATE POLICY "Owners can delete their uploads" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner);
