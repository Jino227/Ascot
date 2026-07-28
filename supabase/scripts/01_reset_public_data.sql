-- DANGER: destructive application-data reset.
-- Run this in the Supabase SQL Editor only when you want to remove all
-- website content, users' public profiles, roles, client assignments, and enquiries.
-- Auth accounts are intentionally NOT deleted by this script.

BEGIN;

-- Some installations may not have all optional CMS tables yet. Build the
-- TRUNCATE statement only from tables that actually exist.
DO $$
DECLARE
  existing_tables text;
BEGIN
  SELECT string_agg(format('%I.%I', 'public', table_name), ', ' ORDER BY table_name)
  INTO existing_tables
  FROM (
    SELECT unnest(ARRAY[
      'activity_logs', 'inquiries', 'website_content', 'product_images',
      'products', 'collection_images', 'collection_clients', 'collections',
      'journey_steps', 'works', 'team', 'videos', 'clients', 'user_roles',
      'profiles'
    ]) AS table_name
  ) requested
  WHERE to_regclass(format('public.%I', table_name)) IS NOT NULL;

  IF existing_tables IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || existing_tables || ' RESTART IDENTITY CASCADE';
  END IF;
END $$;

COMMIT;

-- Verify which application tables exist after the reset.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'user_roles', 'clients', 'collections', 'collection_images',
    'collection_clients', 'products', 'product_images', 'journey_steps',
    'website_content', 'inquiries', 'works', 'team', 'videos', 'activity_logs'
  )
ORDER BY table_name;
