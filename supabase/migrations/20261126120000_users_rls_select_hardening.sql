-- SELECT-hardening op public.users + beperkt publiek profielpad voor media.
-- Volgt op 20261126100000_users_rls_hardening.sql (idempotent).

-- ---------------------------------------------------------------------------
-- PostgREST zet rol primair in request.jwt.claims (JSON); legacy: request.jwt.claim.role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.read_request_jwt_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  direct_role text;
  claims jsonb;
BEGIN
  direct_role := nullif(btrim(current_setting('request.jwt.claim.role', true)), '');
  IF direct_role IS NOT NULL THEN
    RETURN direct_role;
  END IF;

  BEGIN
    claims := current_setting('request.jwt.claims', true)::jsonb;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN NULL;
  END;

  RETURN nullif(btrim(claims ->> 'role'), '');
END;
$$;

COMMENT ON FUNCTION public.read_request_jwt_role() IS
  'PostgREST JWT role: legacy request.jwt.claim.role of request.jwt.claims->>role';

-- ---------------------------------------------------------------------------
-- Trigger: rolwijziging — service_role (beide JWT-vormen) of admin; anders terugdraaien
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.users_enforce_role_on_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  jwt_role := public.read_request_jwt_role();
  IF jwt_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  NEW.role := OLD.role;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Publieke profielkolommen (geen role/e-mail massale export) voor geauthenticeerde clients
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_public_profiles(user_ids uuid[])
RETURNS TABLE (
  id uuid,
  full_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.full_name
  FROM public.users u
  WHERE u.id = ANY(user_ids);
$$;

COMMENT ON FUNCTION public.get_user_public_profiles(uuid[]) IS
  'Limiterende leesweg voor o.a. media-uploader namen (geen e-mail, role of overige kolommen).';

REVOKE ALL ON FUNCTION public.get_user_public_profiles(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_public_profiles(uuid[]) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.read_request_jwt_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_request_jwt_role() TO authenticated;

-- ---------------------------------------------------------------------------
-- SELECT policies: geen volledige users-tabel meer voor elke ingelogde gebruiker
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;
DROP POLICY IF EXISTS "Users can read users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Handmatige / lokale verificatie (in transactie, ROLLBACK aan het einde):
--
-- 1) service_role via claims-JSON (PostgREST default op PG14+):
-- BEGIN;
-- SET LOCAL ROLE service_role;
-- SELECT set_config('request.jwt.claims', '{"role":"service_role"}', true);
-- UPDATE public.users SET role = 'admin' WHERE id = '<test-uuid>';
-- ROLLBACK;
--
-- 2) Gewone user mag role niet wijzigen:
-- BEGIN;
-- SET LOCAL ROLE authenticated;
-- SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"<uid>"}', true);
-- SELECT set_config('request.jwt.claim.sub', '<uid>', true);
-- UPDATE public.users SET role = 'admin' WHERE id = '<uid>';
-- SELECT role FROM public.users WHERE id = '<uid>';  -- nog steeds 'user'
-- ROLLBACK;
--
-- 3) SELECT op andere users geblokkeerd; RPC wel:
-- SELECT * FROM public.users WHERE id <> auth.uid();  -- geen rijen
-- SELECT * FROM public.get_user_public_profiles(ARRAY['<andere-user-uuid>']::uuid[]);
-- ---------------------------------------------------------------------------