-- ===== ROW LEVEL SECURITY =====
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ===== TABLE POLICIES =====
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public collections viewable by anon" ON public.collections;
CREATE POLICY "Public collections viewable by anon" ON public.collections FOR SELECT TO anon USING (is_public = true);
DROP POLICY IF EXISTS "All collections viewable by authenticated" ON public.collections;
CREATE POLICY "Assigned collections viewable by authenticated" ON public.collections FOR SELECT TO authenticated USING (
  is_public = true OR
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.collection_clients cc
    JOIN public.clients c ON c.id = cc.client_id
    WHERE cc.collection_id = collections.id AND c.user_id = auth.uid() AND c.is_active = true
  )
);
DROP POLICY IF EXISTS "Admins manage collections" ON public.collections;
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Collection images: public for anon, private visible only to assigned clients and admins
DROP POLICY IF EXISTS "Public images viewable by anon" ON public.collection_images;
CREATE POLICY "Public images viewable by anon" ON public.collection_images FOR SELECT TO anon USING (is_private = false);
DROP POLICY IF EXISTS "Authenticated view assigned images" ON public.collection_images;
CREATE POLICY "Authenticated view assigned images" ON public.collection_images FOR SELECT TO authenticated USING (
  is_private = false OR
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.collection_clients cc
    JOIN public.clients c ON c.id = cc.client_id
    WHERE cc.collection_id = collection_images.collection_id AND c.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Admins manage collection images" ON public.collection_images;
CREATE POLICY "Admins manage collection images" ON public.collection_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Collection clients
DROP POLICY IF EXISTS "Admins manage collection_clients" ON public.collection_clients;
CREATE POLICY "Admins manage collection_clients" ON public.collection_clients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Clients view own collection assignments" ON public.collection_clients;
CREATE POLICY "Clients view own collection assignments" ON public.collection_clients FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (SELECT 1 FROM public.clients c WHERE c.id = collection_clients.client_id AND c.user_id = auth.uid())
);

-- Clients
DROP POLICY IF EXISTS "Users view own client" ON public.clients;
CREATE POLICY "Users view own client" ON public.clients FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage clients" ON public.clients;
CREATE POLICY "Admins manage clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Journey steps
DROP POLICY IF EXISTS "Journey steps viewable by all" ON public.journey_steps;
CREATE POLICY "Journey steps viewable by all" ON public.journey_steps FOR SELECT TO anon, authenticated USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage journey steps" ON public.journey_steps;
CREATE POLICY "Admins manage journey steps" ON public.journey_steps FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Public products viewable by anon" ON public.products;
CREATE POLICY "Public products viewable by anon" ON public.products FOR SELECT TO anon USING (is_public = true);
DROP POLICY IF EXISTS "All products viewable by authenticated" ON public.products;
CREATE POLICY "All products viewable by authenticated" ON public.products FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Product images viewable by all" ON public.product_images;
CREATE POLICY "Product images viewable by all" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage product images" ON public.product_images;
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Website content viewable by all" ON public.website_content;
CREATE POLICY "Website content viewable by all" ON public.website_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage website content" ON public.website_content;
CREATE POLICY "Admins manage website content" ON public.website_content FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view inquiries" ON public.inquiries;
CREATE POLICY "Admins view inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins update inquiries" ON public.inquiries;
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins delete inquiries" ON public.inquiries;
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Works viewable by all" ON public.works;
CREATE POLICY "Works viewable by all" ON public.works FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage works" ON public.works;
CREATE POLICY "Admins manage works" ON public.works FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Team viewable by all" ON public.team;
CREATE POLICY "Team viewable by all" ON public.team FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage team" ON public.team;
CREATE POLICY "Admins manage team" ON public.team FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Videos viewable by all" ON public.videos;
CREATE POLICY "Videos viewable by all" ON public.videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage videos" ON public.videos;
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Admins view activity logs" ON public.activity_logs;
CREATE POLICY "Admins view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Service role manage logs" ON public.activity_logs;
CREATE POLICY "Service role manage logs" ON public.activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);


-- Designs access
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view public designs" ON public.designs;
CREATE POLICY "Public can view public designs"
  ON public.designs FOR SELECT TO public USING (is_private = false);
DROP POLICY IF EXISTS "Authenticated users can view all designs" ON public.designs;
CREATE POLICY "Authenticated users can view all designs"
  ON public.designs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage designs" ON public.designs;
CREATE POLICY "Admins can manage designs"
  ON public.designs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Celebrity gallery access
ALTER TABLE public.celebrity_showcase ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published celebrity images" ON public.celebrity_showcase;
CREATE POLICY "Public can view published celebrity images"
  ON public.celebrity_showcase FOR SELECT TO public USING (is_published = true);
DROP POLICY IF EXISTS "Admins can manage celebrity images" ON public.celebrity_showcase;
CREATE POLICY "Admins can manage celebrity images"
  ON public.celebrity_showcase FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));