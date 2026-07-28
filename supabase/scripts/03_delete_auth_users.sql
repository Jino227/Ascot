-- EXTREMELY DANGEROUS: permanently deletes every Supabase Auth account.
-- This also removes profiles, roles, clients, and assignments through cascades.
-- Run this only if you want a completely empty authentication system.
-- The public-data reset is intentionally separate so it can be reviewed first.

BEGIN;

DELETE FROM auth.users;

COMMIT;

SELECT count(*) AS remaining_auth_users FROM auth.users;
