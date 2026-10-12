-- Schema inventory expected by this project.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'user_roles', 'clients', 'collections', 'collection_images',
    'collection_clients', 'journey_steps', 'products', 'product_images',
    'website_content', 'inquiries', 'works', 'team', 'videos',
    'activity_logs', 'designs', 'celebrity_showcase'
  )
ORDER BY table_name;

-- Expected storage buckets used by app uploads.
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('collections', 'media')
ORDER BY id;

-- Review default content sections created by the seed file.
SELECT section_key
FROM public.website_content
ORDER BY section_key;

-- To verify the first admin, replace the email and run this query separately.
-- SELECT p.id, p.email, ur.role
-- FROM public.profiles p
-- JOIN public.user_roles ur ON ur.user_id = p.id
-- WHERE lower(p.email) = lower('admin@example.com')
--   AND ur.role = 'admin'::public.app_role;
