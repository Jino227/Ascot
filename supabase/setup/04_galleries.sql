-- 04_galleries.sql
-- Standalone galleries

CREATE TABLE IF NOT EXISTS public.designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  client_name TEXT,
  completion_date TEXT,
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
