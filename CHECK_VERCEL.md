# Check Vercel Deployment - Stap voor Stap

## 🔍 Wat Te Checken in Vercel Dashboard

### 1. Check Build Logs

**Stap 1:**
1. Ga naar Vercel Dashboard
2. Klik op je project
3. Ga naar **Deployments** tab
4. Klik op de **laatste deployment** (meest linkse)
5. Scroll naar **Build Logs**

**Wat zoek je:**
- ✅ Zie je "Route (app)" met een lijst van routes?
- ❌ Zie je errors zoals "Missing Supabase environment variables"?
- ❌ Zie je TypeScript errors?
- ❌ Zie je build failures?

**Deel wat je ziet in de build logs!**

### 2. Check Environment Variables

**Stap 1:**
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Check dat deze 2 variables bestaan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Stap 2:**
Check dat ze ingesteld zijn voor **Production**:
- Klik op elke variable
- Check dat **Production** is aangevinkt ✅

**Stap 3:**
Check de **waarden**:
- `NEXT_PUBLIC_SUPABASE_URL` moet beginnen met `https://` en eindigen met `.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` moet een lange token zijn die begint met `eyJ...`

### 3. Check Runtime Logs

**Stap 1:**
1. Vercel Dashboard → **Deployments**
2. Klik op de laatste deployment
3. Klik op **Functions** tab
4. Klik op een functie (bijv. de homepage route)

**Wat zoek je:**
- ❌ Zie je errors?
- ❌ Zie je "Missing Supabase environment variables"?
- ❌ Zie je andere runtime errors?

**Deel wat je ziet in de runtime logs!**

### 4. Check Project Settings

**Stap 1:**
1. Vercel Dashboard → **Settings** → **General**
2. Scroll naar **Build & Development Settings**

**Check:**
- **Framework Preset**: Moet "Next.js" zijn
- **Build Command**: Moet `next build` zijn (of leeg)
- **Output Directory**: Moet leeg zijn (of `.next`)
- **Install Command**: Moet `npm install` zijn (of leeg)
- **Root Directory**: Moet leeg zijn (of `.`)

### 5. Test Direct Vercel URL

Test de directe Vercel URL (niet custom domain):
- Ga naar Vercel Dashboard → **Deployments**
- Klik op de laatste deployment
- Kopieer de **URL** (bijv. `https://corridor-xxx.vercel.app`)
- Open deze URL in je browser

**Werkt dit?**
- ✅ Ja → Probleem is met custom domain (`corridor.gent`)
- ❌ Nee → Probleem is met de build/deployment zelf

## 🚨 Meest Waarschijnlijke Problemen

### Probleem 1: Environment Variables Niet Beschikbaar Tijdens Build

**Symptoom:**
- Build logs tonen "Missing Supabase environment variables"
- Build faalt of pagina's worden niet gegenereerd

**Oplossing:**
1. Check dat variables zijn ingesteld voor **Production** ✅
2. **Redeploy** na het toevoegen van variables
3. Check dat variable **namen** exact zijn: `NEXT_PUBLIC_SUPABASE_URL` (niet `SUPABASE_URL`)

### Probleem 2: Build Faalt Door Runtime Error

**Symptoom:**
- Build slaagt maar runtime faalt
- 404 error bij het openen van de site

**Oplossing:**
1. Check **Runtime Logs** in Functions tab
2. Fix de errors die je ziet
3. Redeploy

### Probleem 3: Custom Domain Configuratie

**Symptoom:**
- Werkt op `.vercel.app` maar niet op `corridor.gent`

**Oplossing:**
1. Check **Settings** → **Domains**
2. Verifieer dat `corridor.gent` correct is geconfigureerd
3. Check DNS settings

## 📋 Checklist

Voordat je vraagt om hulp, check dit:

- [ ] Environment variables zijn toegevoegd in Vercel
- [ ] Variables zijn ingesteld voor **Production** ✅
- [ ] Variable namen zijn exact: `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Build logs zijn gecheckt
- [ ] Runtime logs zijn gecheckt
- [ ] Project settings zijn gecheckt
- [ ] Direct Vercel URL is getest (niet alleen custom domain)
- [ ] Redeploy is uitgevoerd na het toevoegen van variables

## 💬 Wat Te Delen

Als je nog steeds een 404 krijgt, deel dit:

1. **Build Logs** (laatste 50 regels)
2. **Runtime Logs** (als er errors zijn)
3. **Werkt het op `.vercel.app` URL?** (ja/nee)
4. **Zie je errors in de logs?** (welke?)

## 🔧 Snelle Test

Test lokaal om te zien of het probleem in de code zit:

```bash
# Maak .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Build en test
npm run build
npm run start
# Open http://localhost:3000
```

**Werkt dit lokaal?**
- ✅ Ja → Probleem is in Vercel configuratie
- ❌ Nee → Probleem is in de code
