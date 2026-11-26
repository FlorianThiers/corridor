-- Lokale verificatie (Supabase SQL Editor of psql); pas UUIDs aan.
-- Geen secrets; alleen transactionele checks met set_config.

-- service_role mag role wijzigen (claims-JSON, geen legacy claim.role):
BEGIN;
SET LOCAL ROLE postgres;
UPDATE public.users SET role = role WHERE false; -- noop om search_path te laden
SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
-- Vervang door bestaande test-user:
-- UPDATE public.users SET role = 'admin' WHERE id = '...';
-- SELECT role FROM public.users WHERE id = '...';
ROLLBACK;

-- authenticated user: trigger draait role terug
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000099"}',
  true
);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000099', true);
-- UPDATE public.users SET role = 'admin' WHERE id = '00000000-0000-0000-0000-000000000099';
-- verwacht: role ongewijzigd
ROLLBACK;