-- ===== FULL SCHEMA =====

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.collections (
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
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public collections viewable by anon" ON public.collections FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "All collections viewable by authenticated" ON public.collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage collections" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
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
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public products viewable by anon" ON public.products FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "All products viewable by authenticated" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images viewable by all" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.website_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_content TO authenticated;
GRANT ALL ON public.website_content TO service_role;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Website content viewable by all" ON public.website_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage website content" ON public.website_content FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins view inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ===== WORKS (portfolio/projects) =====
CREATE TABLE public.works (
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
GRANT SELECT ON public.works TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.works TO authenticated;
GRANT ALL ON public.works TO service_role;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Works viewable by all" ON public.works FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage works" ON public.works FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== TEAM (employees) =====
CREATE TABLE public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  image TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team TO authenticated;
GRANT ALL ON public.team TO service_role;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team viewable by all" ON public.team FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage team" ON public.team FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ===== VIDEOS =====
CREATE TABLE public.videos (
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
GRANT SELECT ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos viewable by all" ON public.videos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage videos" ON public.videos FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_works_updated BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_website_content_updated BEFORE UPDATE ON public.website_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER FUNCTION public.set_updated_at() SET search_path = public;
-- ===== Storage: collections bucket + RLS policies =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('collections', 'collections', true, 10485760, '{"image/*"}'::text[])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view collection images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'collections');

CREATE POLICY "Authenticated users can upload collection images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'collections');

CREATE POLICY "Owners can update their uploads" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'collections' AND (SELECT auth.uid()) = owner)
WITH CHECK (bucket_id = 'collections' AND (SELECT auth.uid()) = owner);

CREATE POLICY "Owners can delete their uploads" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'collections' AND (SELECT auth.uid()) = owner);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- ===== SEED: Default website content for Ascot Fashions (clothing brand) =====

INSERT INTO public.website_content (section_key, content) VALUES
('hero', '{
  "eyebrow": "Est. 1985",
  "title": "Where craftsmanship meets contemporary style.",
  "subtitle": "Bespoke tailoring and ready-to-wear collections crafted for those who value precision, quality, and timeless design.",
  "cta": "Explore collections",
  "image": ""
}'::jsonb),
('about', '{
  "eyebrow": "Our Heritage",
  "title": "Four decades of tailoring excellence.",
  "body": "Founded in 1985, Ascot Fashions began as a small tailoring atelier with a commitment to exceptional craftsmanship. Today we create bespoke and ready-to-wear garments for discerning clients worldwide.",
  "image": ""
}'::jsonb),
('process', '{
  "eyebrow": "Our Process",
  "title": "From sketch to stitch, perfected.",
  "pillars": [
    { "icon": "Scissors", "title": "Premium fabrics", "body": "Sourced from the finest mills across Italy, Scotland, and Japan." },
    { "icon": "Sparkles", "title": "Expert tailoring", "body": "Master craftsmen with decades of experience in every stitch." },
    { "icon": "Award", "title": "Perfect fit", "body": "Each garment is cut and fitted to your exact measurements." },
    { "icon": "Leaf", "title": "Sustainable practice", "body": "Ethical production, minimal waste, and responsible sourcing." }
  ]
}'::jsonb),
('testimonials', '{
  "items": []
}'::jsonb),
('contact', '{
  "eyebrow": "Get in touch",
  "title": "Start your fitting.",
  "body": "Book a consultation or inquire about a custom commission. Our team typically responds within 24 hours.",
  "address": "152 Savile Row\nLondon, W1S 3NE",
  "email": "hello@ascotfashions.com",
  "phone": "+44 (0) 20 7946 0128"
}'::jsonb),
('about_page', '{
  "title": "Four decades of tailoring excellence.",
  "subtitle": "From our founding in 1985 to our atelier on Savile Row, every garment tells a story of precision and passion.",
  "image": "",
  "body1": "Ascot Fashions was founded by master tailor William Ascot, who apprenticed on Savile Row before opening his own atelier. His vision was simple: create garments that honour the traditions of British tailoring while embracing modern silhouettes and sensibilities.",
  "body2": "Today, our team of twelve master tailors continues this legacy. Each garment passes through dozens of hands — from pattern cutter to finisher — before it reaches our fitting rooms. We believe that clothing should not just fit, but feel like it belongs to you.",
  "body3": "We serve clients from London to Tokyo, creating everything from business suits and evening wear to casual jackets and overcoats. Every commission is treated with the same attention to detail that has defined our house for four decades.",
  "stats": [
    { "key": "40", "label": "Years of craft" },
    { "key": "12", "label": "Master tailors" },
    { "key": "5,000+", "label": "Garments crafted" }
  ]
}'::jsonb),
('footer', '{
  "description": "Bespoke tailoring and ready-to-wear collections crafted on Savile Row since 1985. Every garment is made to measure, made to last, and made for you.",
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
