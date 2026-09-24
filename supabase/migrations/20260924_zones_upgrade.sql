-- Corridor zones upgrade 2026-09-24
-- Run in Supabase SQL Editor (production) before deploy of feat/zones-upgrade.
-- Idempotent where possible.

-- ---------------------------------------------------------------------------
-- Schema: zones extras
-- ---------------------------------------------------------------------------
ALTER TABLE public.zones
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS field_labels text[] DEFAULT '{}'::text[];

CREATE UNIQUE INDEX IF NOT EXISTS zones_slug_uidx
  ON public.zones (slug)
  WHERE slug IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Schema: zone_photos (admin + UGC with moderation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.zone_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  caption text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS zone_photos_zone_id_idx ON public.zone_photos (zone_id);
CREATE INDEX IF NOT EXISTS zone_photos_status_idx ON public.zone_photos (status);

ALTER TABLE public.zone_photos ENABLE ROW LEVEL SECURITY;

-- Public read: approved only
DROP POLICY IF EXISTS "zone_photos_public_read_approved" ON public.zone_photos;
CREATE POLICY "zone_photos_public_read_approved"
  ON public.zone_photos FOR SELECT
  USING (status = 'approved');

-- Authenticated: insert own pending
DROP POLICY IF EXISTS "zone_photos_auth_insert_pending" ON public.zone_photos;
CREATE POLICY "zone_photos_auth_insert_pending"
  ON public.zone_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND status = 'pending'
  );

-- Submitter can read own photos (any status)
DROP POLICY IF EXISTS "zone_photos_auth_read_own" ON public.zone_photos;
CREATE POLICY "zone_photos_auth_read_own"
  ON public.zone_photos FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

-- Admins / programmers: full access (via users.role)
DROP POLICY IF EXISTS "zone_photos_admin_all" ON public.zone_photos;
CREATE POLICY "zone_photos_admin_all"
  ON public.zone_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  );

-- ---------------------------------------------------------------------------
-- Schema: geschiedenis CMS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.history_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.history_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text NOT NULL DEFAULT '',
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.history_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_milestones_public_read" ON public.history_milestones;
CREATE POLICY "history_milestones_public_read"
  ON public.history_milestones FOR SELECT USING (true);

DROP POLICY IF EXISTS "history_photos_public_read" ON public.history_photos;
CREATE POLICY "history_photos_public_read"
  ON public.history_photos FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "history_milestones_admin_all" ON public.history_milestones;
CREATE POLICY "history_milestones_admin_all"
  ON public.history_milestones FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  );

DROP POLICY IF EXISTS "history_photos_admin_all" ON public.history_photos;
CREATE POLICY "history_photos_admin_all"
  ON public.history_photos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'programmer', 'bestuurder')
    )
  );

-- ---------------------------------------------------------------------------
-- Data: renumber / split zones 7–12
-- Live before: 7 The Hills, 8 Logistiek, 9 Corri Art
-- Target: 7 Parkour, 8 Hilles, 9 RC17, 10 Logistiek, 11 Corri Arts, 12 Lege zone
-- ---------------------------------------------------------------------------

-- Park temp numbers to avoid unique conflicts on zone_number
UPDATE public.zones SET zone_number = 107 WHERE zone_number = 7;
UPDATE public.zones SET zone_number = 108 WHERE zone_number = 8;
UPDATE public.zones SET zone_number = 109 WHERE zone_number = 9;

UPDATE public.zones
SET description = 'Boks, kracht, calisthenics',
    slug = COALESCE(slug, 'strongzone')
WHERE zone_number = 6;

-- New: Parkour (7)
INSERT INTO public.zones (zone_number, name, description, slug, field_labels)
SELECT 7, 'Parkour', 'Parkour', 'parkour', '{}'::text[]
WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE zone_number = 7 OR slug = 'parkour');

-- Hills → Hilles (8)
UPDATE public.zones
SET zone_number = 8,
    name = 'Hilles',
    description = 'Pumptrack',
    slug = 'hilles',
    field_labels = '{}'::text[]
WHERE zone_number = 107;

-- New: RC17 (9)
INSERT INTO public.zones (zone_number, name, description, slug, field_labels)
SELECT 9, 'RC17', 'RC17', 'rc17', ARRAY['Veld 1', 'Veld 2']
WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE zone_number = 9 OR slug = 'rc17');

-- Logistiek → 10
UPDATE public.zones
SET zone_number = 10,
    name = 'Logistiek',
    description = COALESCE(NULLIF(trim(description), ''), 'Afgesloten voor publiek'),
    slug = 'logistiek',
    field_labels = ARRAY['Veld 1', 'Veld 2']
WHERE zone_number = 108;

-- Corri Art → Corri Arts (11)
UPDATE public.zones
SET zone_number = 11,
    name = 'Corri Arts',
    slug = 'corri-arts',
    field_labels = ARRAY['Atelier', 'Leefveld']
WHERE zone_number = 109;

-- New: Lege zone (12)
INSERT INTO public.zones (zone_number, name, description, slug, field_labels)
SELECT 12, 'Lege zone', 'Nog in te vullen', 'lege-zone', ARRAY['Veld 1', 'Veld 2']
WHERE NOT EXISTS (SELECT 1 FROM public.zones WHERE zone_number = 12 OR slug = 'lege-zone');

-- Slugs for 1–5 if missing
UPDATE public.zones SET slug = 'de-vloer' WHERE zone_number = 1 AND slug IS NULL;
UPDATE public.zones SET slug = 'viadunk' WHERE zone_number = 2 AND slug IS NULL;
UPDATE public.zones SET slug = 't-veld' WHERE zone_number = 3 AND slug IS NULL;
UPDATE public.zones SET slug = 'corri-bar' WHERE zone_number = 4 AND slug IS NULL;
UPDATE public.zones SET slug = 'de-bus' WHERE zone_number = 5 AND slug IS NULL;

-- ---------------------------------------------------------------------------
-- Storage bucket note (manual in Dashboard if missing):
--   Bucket name: zone-photos
--   Public: yes (approved URLs are public; pending files still need path obscurity
--            OR keep bucket private and only expose approved via signed URL later)
-- Recommended v1: public bucket + only write approved paths under zone/{id}/approved/
--   and pending under zone/{id}/pending/{userId}/
-- ---------------------------------------------------------------------------
