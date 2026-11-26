-- users RLS hardening (Corrid'Or)
-- Sluit privilege-escalatie via self-UPDATE (role) en willekeurige INSERT.
-- Idempotent; op productie Corrid'Or toegepast op 2026-11-26.

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER → geen recursie in users-RLS)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = user_id
      AND u.role IN ('admin', 'programmer')
  );
$$;

COMMENT ON FUNCTION public.is_admin(uuid) IS
  'Admin/programmer check for RLS; SECURITY DEFINER avoids policy recursion on public.users';

-- handle_new_user moet als owner draaien (trigger op auth.users); geen RLS-bypass voor clients.
DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
    ALTER FUNCTION public.handle_new_user() SET search_path TO public;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- BEFORE UPDATE: gewone gebruikers mogen role niet wijzigen
-- (service_role + admin/programmer via is_admin wel)
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

  jwt_role := coalesce(current_setting('request.jwt.claim.role', true), '');
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

DROP TRIGGER IF EXISTS users_enforce_role_on_update ON public.users;
CREATE TRIGGER users_enforce_role_on_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_enforce_role_on_update();

-- ---------------------------------------------------------------------------
-- Policies: UPDATE eigen profiel (dubbel samengevoegd)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Policies: admin UPDATE / DELETE via is_admin (geen EXISTS-subquery op users)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Policies: INSERT beperkt tot eigen rij + role user
-- (handle_new_user / service_role bypassen RLS; ensureUserProfileRow + auth callback blijven werken)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can be created" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = 'user'
  );

-- ---------------------------------------------------------------------------
-- SELECT: ongewijzigd gelaten
-- App leest andere gebruikers o.a. in lib/media-api.ts (uploader-namen bij zone_photos).
-- Eigen profiel + admin-lijst blijven via bestaande policies werken.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Handmatige verificatie (lokaal / staging, als ingelogde gewone user):
--
-- UPDATE public.users SET role = 'admin' WHERE id = auth.uid();
--   → role moet ongewijzigd blijven (trigger).
--
-- INSERT INTO public.users (id, email, full_name, role)
--   VALUES (gen_random_uuid(), 'x@y.z', 'x', 'admin');
--   → RLS-weigering.
--
-- INSERT INTO public.users (id, email, full_name, role)
--   VALUES (auth.uid(), 'me@example.com', 'Me', 'user');
--   → mag slagen als nog geen rij (anders duplicate key).
-- ---------------------------------------------------------------------------