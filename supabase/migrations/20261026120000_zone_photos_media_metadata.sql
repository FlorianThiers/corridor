-- Optional metadata for zone photos (media API + credit workflow).
-- Apply manually in Supabase when ready — not required for the read API (fallbacks exist).

ALTER TABLE public.zone_photos
  ADD COLUMN IF NOT EXISTS alt text,
  ADD COLUMN IF NOT EXISTS credit text,
  ADD COLUMN IF NOT EXISTS artist_tag text,
  ADD COLUMN IF NOT EXISTS has_recognisable_people boolean,
  ADD COLUMN IF NOT EXISTS media_source text
    CHECK (media_source IS NULL OR media_source IN ('florian', 'upload', 'corristories')),
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS license text;

COMMENT ON COLUMN public.zone_photos.media_source IS
  'Explicit source for UC media feed when path heuristics are insufficient.';
