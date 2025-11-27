# ✅ Productie Deployment Checklist

## Kritieke Stappen (MOET worden gedaan)

### 1. Supabase Database Setup ✅
- [x] **RLS Policies uitvoeren** - ✅ Uitgevoerd in Supabase SQL Editor
  - RLS policies zijn geconfigureerd en actief
  - Alle tabellen hebben correcte RLS policies

- [x] **RLS inschakelen** - ✅ Ingeschakeld voor alle tabellen:
  - `activities` - ✅ RLS enabled
  - `agenda_items` - ✅ RLS enabled
  - `corristories` - ✅ RLS enabled
  - `zones` - ✅ RLS enabled
  - `users` - ✅ RLS enabled

### 2. Vercel Environment Variables ⚠️
- [ ] Ga naar Vercel Dashboard → Project Settings → Environment Variables
- [ ] Voeg toe:
  ```
  SUPABASE_URL=https://vwbrvxkzjwpppagkpipf.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- [ ] Selecteer **alle environments** (Production, Preview, Development)
- [ ] **Redeploy** na het toevoegen

### 3. Testen
- [ ] Website laadt zonder errors
- [ ] Data wordt geladen (activiteiten, evenementen, etc.)
- [ ] Login werkt
- [ ] Admin panel toegankelijk voor admins
- [ ] Admin panel geblokkeerd voor niet-admins

## Optionele Optimalisaties

- [ ] Console logs verwijderen (optioneel)
- [ ] Google Analytics toevoegen (optioneel)
- [ ] Error monitoring instellen (optioneel)

## Belangrijke Bestanden

✅ **Moet blijven**:
- `package.json` - Dependencies
- `scripts/build-config.js` - Build script
- Alle HTML/JS/CSS bestanden

❌ **Verwijderd**:
- `supabase/rls-policies.sql` - ✅ Uitgevoerd in Supabase
- `supabase/README.md` - ✅ Verwijderd

## Snelle Start

1. **Supabase**: ✅ RLS policies uitgevoerd
2. **Vercel**: Stel environment variables in
3. **Deploy**: Push naar Git (Vercel deployt automatisch)
4. **Test**: Controleer of alles werkt

Zie [DEPLOYMENT.md](./DEPLOYMENT.md) voor gedetailleerde instructies.

