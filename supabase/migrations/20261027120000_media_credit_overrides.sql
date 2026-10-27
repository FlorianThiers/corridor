-- Urban Culture writes the credit for a stable media id after it approves a claim.
-- Corridor does not store the claim itself. Apply this file manually in the
-- Supabase SQL editor. The app does not run it.
--
-- Until the table exists, GET /api/v1/media keeps serving default credits and
-- PATCH /api/v1/media/:id returns 503.

CREATE TABLE IF NOT EXISTS public.media_credit_overrides (
  media_id text PRIMARY KEY,
  credit text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_credit_overrides_media_id_len CHECK (char_length(media_id) BETWEEN 1 AND 200),
  CONSTRAINT media_credit_overrides_credit_len CHECK (char_length(btrim(credit)) BETWEEN 1 AND 200)
);

COMMENT ON TABLE public.media_credit_overrides IS
  'Credit set by Urban Culture for one id from GET /api/v1/media. Only the credit is stored.';

ALTER TABLE public.media_credit_overrides ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.media_credit_overrides FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_credit_overrides TO service_role;

CREATE INDEX IF NOT EXISTS media_credit_overrides_updated_at_idx
  ON public.media_credit_overrides (updated_at);
