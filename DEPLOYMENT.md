# 🚀 Productie Deployment Checklist - Corridor Website

## Pre-Deployment Checklist

### 1. Supabase Database Setup ✅
- [ ] **RLS Policies uitvoeren**: Voer `supabase/rls-policies.sql` uit in Supabase SQL Editor
  - Ga naar Supabase Dashboard → SQL Editor
  - Kopieer de inhoud van `supabase/rls-policies.sql`
  - Voer uit en verifieer dat alle policies zijn aangemaakt
  
- [ ] **Database tabellen controleren**:
  - [ ] `activities` - bestaat en heeft data
  - [ ] `agenda_items` - bestaat en heeft data
  - [ ] `corristories` - bestaat en heeft data
  - [ ] `zones` - bestaat en heeft data
  - [ ] `users` - bestaat en heeft minstens één admin/programmeur account

- [ ] **RLS (Row Level Security) inschakelen** voor alle tabellen:
  - Ga naar Table Editor → Selecteer tabel → Settings → Enable RLS

### 2. Environment Variables ✅
- [ ] **Vercel Environment Variables instellen**:
  - `SUPABASE_URL` - Je Supabase project URL
  - `SUPABASE_ANON_KEY` - Je Supabase anon/public key
  
  **Hoe te doen:**
  1. Ga naar Vercel Dashboard → Project Settings → Environment Variables
  2. Voeg beide variabelen toe voor Production, Preview en Development
  3. De build script zal automatisch `js/supabase-config.js` genereren

### 3. Build Script ✅
- [ ] **Build script testen lokaal**:
  ```bash
  npm install
  npm run build
  ```
- [ ] Verifieer dat `js/supabase-config.js` correct wordt gegenereerd met productie credentials

### 4. Code Cleanup ✅
- [ ] **Console logs verwijderen** (optioneel, maar aanbevolen voor productie)
- [ ] **Test/debug code verwijderen**
- [ ] **Error handling controleren** - alle errors worden netjes afgehandeld

### 5. Security Check ✅
- [ ] **Admin routes beveiligd** - alleen ingelogde admins kunnen admin pagina's zien
- [ ] **RLS policies correct** - anonieme gebruikers kunnen alleen lezen wat nodig is
- [ ] **Geen hardcoded credentials** - alles via environment variables
- [ ] **CORS instellingen** - Supabase project heeft correcte CORS origins

### 6. Performance ✅
- [ ] **Images geoptimaliseerd** - grote bestanden gecomprimeerd
- [ ] **Lazy loading** - waar mogelijk
- [ ] **CDN voor assets** - Vercel doet dit automatisch

### 7. Testing ✅
- [ ] **Functionaliteit testen**:
  - [ ] Homepage laadt correct
  - [ ] Navigatie werkt
  - [ ] Activiteiten worden geladen
  - [ ] Agenda items worden geladen
  - [ ] Corristories worden geladen
  - [ ] Login/registratie werkt
  - [ ] Admin panel toegankelijk voor admins
  - [ ] Admin panel geblokkeerd voor niet-admins
  
- [ ] **Mobile responsive testen**
- [ ] **Browser compatibility** (Chrome, Firefox, Safari, Edge)

### 8. Vercel Deployment ✅
- [ ] **Project verbonden met Git repository**
- [ ] **Build Command**: `npm run build` (of automatisch via postinstall)
- [ ] **Output Directory**: `/` (root)
- [ ] **Install Command**: `npm install`
- [ ] **Environment Variables** ingesteld (zie punt 2)

### 9. Post-Deployment ✅
- [ ] **URL testen** - website werkt op productie URL
- [ ] **Supabase verbinding testen** - data wordt geladen
- [ ] **Admin login testen** - kan inloggen en admin panel gebruiken
- [ ] **Error monitoring** - Vercel logs controleren voor errors
- [ ] **Analytics** (optioneel) - Google Analytics of Vercel Analytics inschakelen

## Belangrijke Bestanden

### ✅ Moet blijven:
- `package.json` - NPM dependencies
- `scripts/build-config.js` - Build script voor environment variables
- Alle HTML, JS en CSS bestanden

### ❌ Verwijderd (na deployment):
- `supabase/rls-policies.sql` - ✅ Uitgevoerd in Supabase, niet meer nodig
- `supabase/README.md` - ✅ Verwijderd

## Supabase RLS Policies Status

✅ **RLS Policies zijn uitgevoerd** - Alle policies zijn geconfigureerd in Supabase

**Verificatie**:
- Ga naar Supabase Dashboard → Table Editor → Selecteer een tabel → Klik op **RLS** tab
- Je zou de policies moeten zien voor: `activities`, `agenda_items`, `corristories`, `zones`

## Environment Variables in Vercel

1. Ga naar je Vercel project dashboard
2. Klik op **Settings** → **Environment Variables**
3. Voeg toe:
   - **Name**: `SUPABASE_URL`
   - **Value**: Je Supabase project URL (bijv. `https://xxxxx.supabase.co`)
   - **Environment**: Production, Preview, Development (selecteer alle drie)
   
4. Voeg toe:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: Je Supabase anon key (vind je in Project Settings → API)
   - **Environment**: Production, Preview, Development

5. **Redeploy** je project na het toevoegen van environment variables

## Troubleshooting

### Data wordt niet geladen
- Controleer of RLS policies zijn uitgevoerd
- Controleer Supabase logs voor errors
- Verifieer dat environment variables correct zijn ingesteld

### Admin panel werkt niet
- Controleer of je bent ingelogd
- Controleer of je account de rol `admin` of `programmeur` heeft
- Controleer browser console voor errors

### Build faalt
- Controleer of alle environment variables zijn ingesteld
- Controleer `package.json` voor correcte dependencies
- Kijk naar build logs in Vercel dashboard

## Contact

Voor vragen over deployment:
- **Developer**: Florian Thiers - [florian-tau.vercel.app](https://florian-tau.vercel.app)
- **Project**: Corridor - Urban Sport Hub Gentbrugge

