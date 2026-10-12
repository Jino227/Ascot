-- Run this in the CURRENT project's Supabase SQL Editor.
-- The project's Global file size limit must also be at least 200 MB.
-- Collections is used for image uploads; media is used for images and videos.
UPDATE storage.buckets
SET file_size_limit = 104857600, -- 100 MB
    allowed_mime_types = '{"image/*"}'::text[]
WHERE id = 'collections';

UPDATE storage.buckets
SET file_size_limit = 209715200, -- 200 MB
    allowed_mime_types = '{"image/*", "video/*"}'::text[]
WHERE id = 'media';

-- Verify the bucket-level limits.
SELECT id, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('collections', 'media')
ORDER BY id;
