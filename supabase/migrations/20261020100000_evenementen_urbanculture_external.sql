-- Urban Culture → Corridor agenda push (dedupe on UC event id).

ALTER TABLE public.evenementen
  ADD COLUMN IF NOT EXISTS external_source text,
  ADD COLUMN IF NOT EXISTS external_id text;

CREATE UNIQUE INDEX IF NOT EXISTS evenementen_external_source_id_key
  ON public.evenementen (external_source, external_id)
  WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

COMMENT ON COLUMN public.evenementen.external_source IS 'Upstream system, e.g. urbanculture';
COMMENT ON COLUMN public.evenementen.external_id IS 'Stable id in upstream (UC events.id)';
