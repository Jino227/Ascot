-- Migration: Create flat designs table
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS designs_display_order_idx ON designs (display_order, created_at);

-- RLS: public can read non-private rows
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view public designs" ON designs;
CREATE POLICY "Public can view public designs"
  ON designs FOR SELECT TO public
  USING (is_private = FALSE);

DROP POLICY IF EXISTS "Authenticated users can view all designs" ON designs;
CREATE POLICY "Authenticated users can view all designs"
  ON designs FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage designs" ON designs;
CREATE POLICY "Admins can manage designs"
  ON designs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
