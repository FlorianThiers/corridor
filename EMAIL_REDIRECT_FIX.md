# Email Redirect URL Fix

## Probleem
Wanneer gebruikers zich registreren op `corridor.gent`, krijgen ze een email link naar `localhost:3000` in plaats van `corridor.gent`.

## Oorzaak
Supabase gebruikt mogelijk de **Site URL** uit de dashboard configuratie in plaats van de `emailRedirectTo` parameter die we doorgeven.

## Oplossing

### 1. Environment Variable Toevoegen

Voeg `NEXT_PUBLIC_SITE_URL` toe aan je environment variables:

**Voor Vercel (Productie):**
1. Ga naar Vercel Dashboard → Project → Settings → Environment Variables
2. Voeg toe:
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://corridor.gent`
   - Environment: Production

**Voor lokaal (.env.local):**
```env
NEXT_PUBLIC_SITE_URL=https://corridor.gent
```

### 2. Supabase Dashboard Configuratie

**BELANGRIJK:** Controleer deze instellingen in Supabase Dashboard:

1. Ga naar **Authentication** → **URL Configuration**
2. **Site URL** moet zijn:
   - Productie: `https://corridor.gent`
   - (Laat localhost leeg of gebruik alleen voor development)
3. **Redirect URLs** moeten bevatten:
   - `https://corridor.gent/auth/callback`
   - `https://corridor.gent/reset-password`
   - `http://localhost:3000/auth/callback` (alleen voor development)

### 3. Code Aanpassing

De code gebruikt nu:
- `NEXT_PUBLIC_SITE_URL` als eerste keuze (als beschikbaar)
- `window.location.origin` als fallback

Dit betekent:
- In productie: gebruikt `https://corridor.gent` (van environment variable)
- In development: gebruikt `http://localhost:3000` (van window.location.origin)

## Testen

1. **Zorg dat `NEXT_PUBLIC_SITE_URL` is ingesteld in Vercel**
2. **Redeploy naar productie**
3. **Registreer een nieuw account op corridor.gent**
4. **Check de email** - de link zou moeten zijn: `https://corridor.gent/auth/callback?token=...`

## Troubleshooting

Als de email link nog steeds naar localhost gaat:

1. **Check Supabase Site URL:**
   - Ga naar Supabase Dashboard → Authentication → URL Configuration
   - Zorg dat Site URL = `https://corridor.gent`

2. **Check Redirect URLs:**
   - Zorg dat `https://corridor.gent/auth/callback` in de lijst staat

3. **Check Environment Variable:**
   - Zorg dat `NEXT_PUBLIC_SITE_URL=https://corridor.gent` is ingesteld in Vercel
   - Redeploy na het toevoegen van de variable

4. **Check Console Logs:**
   - Open browser console tijdens registratie
   - Je zou moeten zien: "Signup redirect URL: https://corridor.gent/auth/callback"
