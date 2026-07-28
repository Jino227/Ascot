-- Promote an existing Supabase Auth user to administrator by email.
-- Create the account first in Supabase Dashboard > Authentication > Users.
-- Supabase securely stores the password; this SQL only assigns the role.

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  normalized_email text := lower(trim(target_email));
BEGIN
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE lower(email) = normalized_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No Auth user exists with email %', target_email;
  END IF;

  INSERT INTO public.profiles (id, full_name, email)
  SELECT id, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email), email
  FROM auth.users
  WHERE id = target_user_id
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Replace the email below with the administrator's Auth email.
SELECT public.promote_user_to_admin('admin@example.com');

-- Confirm the result.
SELECT p.id, p.email, ur.role
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE lower(p.email) = lower('admin@example.com')
  AND ur.role = 'admin';
