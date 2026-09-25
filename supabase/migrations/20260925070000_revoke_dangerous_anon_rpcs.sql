-- Corrid'Or: revoke PostgREST access to dangerous SECURITY DEFINER helpers.
-- Applied on project vwbrvxkzjwpppagkpipf (2026-09-25).
-- Triggers (handle_new_user) keep working as owner; clients must not call these via /rest/v1/rpc.

REVOKE ALL ON FUNCTION public.create_user_complete(text, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.upsert_user_profile(uuid, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

ALTER FUNCTION public.create_user_complete(text, text, text, boolean) SET search_path TO 'public', 'auth', 'extensions';
ALTER FUNCTION public.upsert_user_profile(uuid, text, text, boolean) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
