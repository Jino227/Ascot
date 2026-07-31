-- 02_roles_and_clients.sql
-- Run this after 01_auth_and_profiles.sql

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies for user_roles and clients
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles read access" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "admin manage user_roles" ON public.user_roles USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients read access" ON public.clients FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admin manage clients" ON public.clients USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
