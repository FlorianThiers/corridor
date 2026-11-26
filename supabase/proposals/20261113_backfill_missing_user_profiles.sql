-- Alleen handmatig uitvoeren door Florian in Supabase SQL Editor (niet door CI/agent).
-- Doel: public.users-rij voor auth-gebruikers die al bestonden vóór recente releases
-- maar geen profiel meer hebben (of nooit gekregen via handle_new_user).

INSERT INTO public.users (id, email, full_name, role)
SELECT
  au.id,
  lower(trim(au.email)),
  coalesce(
    nullif(trim(au.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(au.raw_user_meta_data->>'name'), ''),
    split_part(au.email, '@', 1)
  ),
  'user'
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
