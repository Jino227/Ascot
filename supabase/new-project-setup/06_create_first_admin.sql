-- BEFORE running this file:
-- 1) Create the user in Supabase Dashboard > Authentication > Users.
-- 2) Replace admin@example.com below with that exact Auth email.
-- This assigns an admin role; it does not create or reset a password.

DO $$
DECLARE
  target_user auth.users%ROWTYPE;
  admin_email text := 'admin@example.com'; -- CHANGE THIS
BEGIN
  SELECT *
  INTO target_user
  FROM auth.users
  WHERE lower(email) = lower(trim(admin_email))
  LIMIT 1;

  IF target_user.id IS NULL THEN
    RAISE EXCEPTION
      'No Auth user found for %. Create the user in Supabase Authentication first.',
      admin_email;
  END IF;

  -- The auth trigger normally creates this profile; this safely repairs it
  -- if the user was created before the trigger was installed.
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    target_user.id,
    COALESCE(
      target_user.raw_user_meta_data->>'full_name',
      target_user.raw_user_meta_data->>'name',
      target_user.email
    ),
    target_user.email,
    target_user.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user.id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END
$$;

-- Confirm the promotion. This should return one row with role = admin.
SELECT p.id, p.email, ur.role
FROM public.profiles AS p
JOIN public.user_roles AS ur ON ur.user_id = p.id
WHERE lower(p.email) = lower('admin@example.com') -- CHANGE THIS TOO
  AND ur.role = 'admin'::public.app_role;
