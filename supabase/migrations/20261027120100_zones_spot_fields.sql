-- Optional fields for GET /api/v1/zones.
-- The endpoint already returns rules.spray_allowed and coordinates as null
-- when these columns are missing or unset. Apply manually. Do not run from the app.
-- This file does not fill in values.

ALTER TABLE public.zones
  ADD COLUMN IF NOT EXISTS spray_allowed boolean,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN public.zones.spray_allowed IS
  'Whether spray paint is allowed in this zone. NULL means not set.';
COMMENT ON COLUMN public.zones.latitude IS
  'WGS84 latitude for the zone as a Urban Culture spot. NULL if unknown.';
COMMENT ON COLUMN public.zones.longitude IS
  'WGS84 longitude for the zone as a Urban Culture spot. NULL if unknown.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'zones_latitude_range'
  ) THEN
    ALTER TABLE public.zones
      ADD CONSTRAINT zones_latitude_range
      CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'zones_longitude_range'
  ) THEN
    ALTER TABLE public.zones
      ADD CONSTRAINT zones_longitude_range
      CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;
