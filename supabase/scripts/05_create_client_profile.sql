-- Create a premium client profile for an existing Auth user.
-- Replace the UUID and client details before executing.

CREATE OR REPLACE FUNCTION public.create_client_profile(
  target_user_id uuid,
  target_company_name text DEFAULT NULL,
  target_contact_person text DEFAULT NULL,
  target_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_client_id uuid;
  target_email text;
  existing_client_id uuid;
BEGIN
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;
  IF target_email IS NULL THEN
    RAISE EXCEPTION 'No Auth user exists with id %', target_user_id;
  END IF;

  SELECT id INTO existing_client_id
  FROM public.clients
  WHERE user_id = target_user_id
  ORDER BY created_at
  LIMIT 1;

  IF existing_client_id IS NULL THEN
    INSERT INTO public.clients (user_id, company_name, contact_person, email, phone, is_active)
    VALUES (target_user_id, target_company_name, target_contact_person, target_email, target_phone, true)
    RETURNING id INTO new_client_id;
  ELSE
    UPDATE public.clients
    SET company_name = target_company_name,
        contact_person = target_contact_person,
        email = target_email,
        phone = target_phone,
        is_active = true
    WHERE id = existing_client_id;
    new_client_id := existing_client_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new_client_id;
END;
$$;

-- Example: replace the UUID and details before executing.
-- SELECT public.create_client_profile(
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   'Example Company',
--   'Client Name',
--   '+1 555 000 0000'
-- );
