-- Supabase blocks direct DELETE statements against storage.objects.
-- Use the Storage API script reset-storage.mjs instead.
-- This query only inspects the files that would be removed.
SELECT bucket_id, count(*) AS remaining_files
FROM storage.objects
WHERE bucket_id IN ('collections', 'media')
GROUP BY bucket_id
ORDER BY bucket_id;
