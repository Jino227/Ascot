-- 03_collections_and_products.sql
-- Run this after 02_roles_and_clients.sql

CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_clients (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.collection_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  composition TEXT,
  weight_gsm INT,
  width_cm INT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
