-- Auto-approve zone UGC during Corri d'Or Fest (until end of 26 Sep Brussels)
CREATE OR REPLACE FUNCTION public.zone_photos_fest_auto_approve()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending'
     AND now() < timestamptz '2026-09-27 00:00:00+02' THEN
    UPDATE public.zone_photos
    SET status = 'approved',
        reviewed_at = now(),
        updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zone_photos_fest_auto_approve_trg ON public.zone_photos;
CREATE TRIGGER zone_photos_fest_auto_approve_trg
  AFTER INSERT ON public.zone_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.zone_photos_fest_auto_approve();
