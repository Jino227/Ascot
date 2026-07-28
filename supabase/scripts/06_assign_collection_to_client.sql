-- Assign a collection to a client. Private images in that collection become visible.

CREATE OR REPLACE FUNCTION public.assign_collection_to_client(
  target_collection_id uuid,
  target_client_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.collections WHERE id = target_collection_id) THEN
    RAISE EXCEPTION 'Collection does not exist: %', target_collection_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = target_client_id AND is_active = true) THEN
    RAISE EXCEPTION 'Active client does not exist: %', target_client_id;
  END IF;

  INSERT INTO public.collection_clients (collection_id, client_id)
  VALUES (target_collection_id, target_client_id)
  ON CONFLICT (collection_id, client_id) DO NOTHING;
END;
$$;

-- Remove a collection assignment.
CREATE OR REPLACE FUNCTION public.unassign_collection_from_client(
  target_collection_id uuid,
  target_client_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.collection_clients
  WHERE collection_id = target_collection_id
    AND client_id = target_client_id;
END;
$$;

-- Examples after replacing UUIDs:
-- SELECT public.assign_collection_to_client(
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   '00000000-0000-0000-0000-000000000000'::uuid
-- );
-- SELECT public.unassign_collection_from_client(
--   '00000000-0000-0000-0000-000000000000'::uuid,
--   '00000000-0000-0000-0000-000000000000'::uuid
-- );
