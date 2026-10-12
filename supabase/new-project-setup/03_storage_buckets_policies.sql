-- ===== STORAGE =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('collections', 'collections', true, 104857600, '{"image/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 209715200, '{"image/*", "video/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

-- Raise existing buckets too. The INSERT statements above do not alter an
-- already-created bucket because of ON CONFLICT DO NOTHING.
UPDATE storage.buckets
SET file_size_limit = 104857600,
    allowed_mime_types = '{"image/*"}'::text[]
WHERE id = 'collections';

UPDATE storage.buckets
SET file_size_limit = 209715200,
    allowed_mime_types = '{"image/*", "video/*"}'::text[]
WHERE id = 'media';

DROP POLICY IF EXISTS "Public can view collection images" ON storage.objects;
CREATE POLICY "Public can view collection images"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('collections', 'media'));

DROP POLICY IF EXISTS "Auth users can upload to collections and media" ON storage.objects;
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

-- Revoke dangerous function access
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

