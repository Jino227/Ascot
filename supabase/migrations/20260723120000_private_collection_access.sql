-- Enforce the premium collection visibility contract for authenticated users.
-- Public collections remain visible to everyone; private collections require an assignment.

DROP POLICY IF EXISTS "All collections viewable by authenticated" ON public.collections;
CREATE POLICY "Assigned collections viewable by authenticated"
ON public.collections FOR SELECT TO authenticated
USING (
  is_public = true
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.collection_clients cc
    JOIN public.clients c ON c.id = cc.client_id
    WHERE cc.collection_id = collections.id
      AND c.user_id = auth.uid()
      AND c.is_active = true
  )
);

DROP POLICY IF EXISTS "Clients view own collection assignments" ON public.collection_clients;
CREATE POLICY "Clients view own collection assignments"
ON public.collection_clients FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = collection_clients.client_id AND c.user_id = auth.uid()
  )
);
