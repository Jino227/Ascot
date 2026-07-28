-- ═══════════════════════════════════════════════════
-- Complete Supabase setup — safe to re-run
-- Run the entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- ===== TABLES =====
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, client_id)
);

ALTER TABLE public.collection_clients ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE;
ALTER TABLE public.collection_clients ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.collection_clients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE UNIQUE INDEX IF NOT EXISTS collection_clients_collection_id_client_id_key
ON public.collection_clients (collection_id, client_id);

CREATE TABLE IF NOT EXISTS public.journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  image TEXT,
  step_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  composition TEXT,
  weight_gsm INT,
  width_cm INT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  client_name TEXT,
  completion_date DATE,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  image TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== FUNCTIONS =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== TRIGGERS =====
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_collections_updated ON public.collections;
CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_website_content_updated ON public.website_content;
CREATE TRIGGER trg_website_content_updated BEFORE UPDATE ON public.website_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_works_updated ON public.works;
CREATE TRIGGER trg_works_updated BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_journey_steps_updated ON public.journey_steps;
CREATE TRIGGER trg_journey_steps_updated BEFORE UPDATE ON public.journey_steps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

-- ===== STORAGE =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('collections', 'collections', true, 10485760, '{"image/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 209715200, '{"image/*", "video/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view collection images" ON storage.objects;
CREATE POLICY "Public can view collection images"
ON storage.objects FOR SELECT TO public
USING (bucket_id IN ('collections', 'media'));

DROP POLICY IF EXISTS "Auth users can upload to collections and media" ON storage.objects;
CREATE POLICY "Auth users can upload to collections and media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('collections', 'media'));

DROP POLICY IF EXISTS "Owners can update their uploads" ON storage.objects;
CREATE POLICY "Owners can update their uploads" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner)
WITH CHECK (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner);

DROP POLICY IF EXISTS "Owners can delete their uploads" ON storage.objects;
CREATE POLICY "Owners can delete their uploads" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('collections', 'media') AND (SELECT auth.uid()) = owner);

-- Revoke dangerous function access
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- ===== SEED DATA =====
INSERT INTO public.website_content (section_key, content) VALUES
('hero', '{
  "eyebrow": "Est. 1985",
  "title": "Where craftsmanship meets contemporary style.",
  "subtitle": "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.",
  "cta": "Explore collections",
  "image": "",
  "video_url": ""
}'::jsonb),
('about', '{
  "eyebrow": "Our Heritage",
  "title": "Four decades of tailoring excellence.",
  "body": "Founded in 1985, Ascot Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.",
  "image": "",
  "stats": [
    {"key": "40+", "label": "Years of craft"},
    {"key": "200+", "label": "Skilled artisans"},
    {"key": "50+", "label": "Export countries"},
    {"key": "10K+", "label": "Garments annually"}
  ]
}'::jsonb),
('process', '{
  "eyebrow": "Our Manufacturing Strength",
  "title": "From design to dispatch.",
  "pillars": [
    { "icon": "Sparkles", "title": "Design Studio", "body": "Creative designers transform concepts into embroidery-ready artwork and sampling." },
    { "icon": "Scissors", "title": "Sampling", "body": "Rapid prototyping with meticulous attention to every detail." },
    { "icon": "Award", "title": "Embroidery", "body": "Master craftsmen with decades of experience in every stitch." },
    { "icon": "Leaf", "title": "Production", "body": "Scalable manufacturing with consistent quality across every piece." },
    { "icon": "Sparkles", "title": "Quality Control", "body": "Each piece undergoes detailed inspection for stitches, beads, finishing and quality." },
    { "icon": "Leaf", "title": "Packaging", "body": "Products are carefully packed and shipped worldwide." }
  ]
}'::jsonb),
('testimonials', '{
  "eyebrow": "Global Trust",
  "items": []
}'::jsonb),
('contact', '{
  "eyebrow": "Get in touch",
  "title": "Start your next project.",
  "body": "Request a catalogue or contact our sales team. We typically respond within 24 hours.",
  "address": "152 Savile Row\nLondon, W1S 3NE",
  "email": "hello@ascotfashions.com",
  "phone": "+44 (0) 20 7946 0128",
  "cta": "Request Catalogue"
}'::jsonb),
('about_page', '{
  "title": "Four decades of tailoring excellence.",
  "subtitle": "From our founding in 1985 to our atelier on Savile Row, every garment tells a story of precision and passion.",
  "image": "",
  "body1": "Ascot Fashions was founded by master tailor William Ascot, who apprenticed on Savile Row before opening his own atelier. His vision was simple: create garments that honour the traditions of British tailoring while embracing modern silhouettes and sensibilities.",
  "body2": "Today, our team of twelve master tailors continues this legacy. Each garment passes through dozens of hands — from pattern cutter to finisher — before it reaches our fitting rooms.",
  "body3": "We serve clients from London to Tokyo, creating everything from business suits and evening wear to casual jackets and overcoats.",
  "stats": [
    { "key": "40+", "label": "Years of craft" },
    { "key": "200+", "label": "Skilled workforce" },
    { "key": "10", "label": "Certifications" },
    { "key": "50+", "label": "Export countries" }
  ]
}'::jsonb),
('footer', '{
  "description": "Bespoke tailoring and ready-to-wear collections crafted since 1985.",
  "address": "152 Savile Row\nLondon, W1S 3NE",
  "email": "hello@ascotfashions.com",
  "phone": "+44 (0) 20 7946 0128",
  "copyright": "Made to last."
}'::jsonb),
('company_gallery', '{
  "title": "Behind the scenes",
  "images": [
    {"url": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80", "caption": "Master tailor at work on a bespoke jacket", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80", "caption": "Modern cutting room with precision machinery", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", "caption": "The full Ascot Fashions team", "category": "group"},
    {"url": "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800&q=80", "caption": "Pattern makers collaborating on a new design", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80", "caption": "Industrial sewing machines in production", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=800&q=80", "caption": "Quality inspection of finished garments", "category": "employees"},
    {"url": "https://images.unsplash.com/photo-1556755134-38b4e8b04b58?w=800&q=80", "caption": "Fabric archive and material selection room", "category": "machines"},
    {"url": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80", "caption": "Team meeting and project review", "category": "group"}
  ]
}'::jsonb)
ON CONFLICT (section_key) DO NOTHING;

-- Demo journey steps
INSERT INTO public.journey_steps (title, subtitle, description, image, step_order, is_published) VALUES
('Material Sourcing', 'Premium materials from trusted suppliers', 'Every masterpiece begins by selecting premium fabrics, threads, beads, sequins, zari and trims from trusted suppliers. Every material is inspected before entering production.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80', 1, true),
('Hand Dyeing', 'Traditional colour mastery', 'Traditional dyeing techniques produce rich colours with excellent consistency and durability, creating the perfect foundation for every garment.', 'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=1200&q=80', 2, true),
('Design Studio', 'Concepts to embroidery-ready artwork', 'Creative designers transform concepts into embroidery-ready artwork and sampling, working closely with clients to bring visions to life.', 'https://images.unsplash.com/photo-1604328698692-f76ea9498e72?w=1200&q=80', 3, true),
('Artwork Preparation', 'Designs transferred to fabric', 'Designs are accurately transferred to fabric using precision techniques that guide every stitch with absolute accuracy.', 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1200&q=80', 4, true),
('Hand Embroidery', 'Traditional craftsmanship', 'Experienced artisans create intricate embroidery using traditional techniques passed down through generations.', 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1200&q=80', 5, true),
('Stitching & Production', 'Pattern to final garment', 'Pattern making, cutting, stitching, finishing and pressing produce the final garment with meticulous attention to every detail.', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80', 6, true),
('Quality Inspection', 'Detailed quality assurance', 'Each piece undergoes detailed inspection for stitches, beads, finishing and overall quality before approval.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80', 7, true),
('Final Approval', 'Senior verification', 'Senior merchandisers verify workmanship and client specifications meet our exacting standards.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80', 8, true),
('Packaging & Dispatch', 'Worldwide delivery', 'Products are carefully packed and shipped to clients around the world, ensuring they arrive in perfect condition.', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80', 9, true)
ON CONFLICT DO NOTHING;
