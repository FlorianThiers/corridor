# Vercel 404 Error Fix Guide

## Probleem
Je krijgt een 404 NOT_FOUND error bij het openen van `https://www.corridor.gent/`

## Oorzaken

De 404 error kan verschillende oorzaken hebben:

### 1. Environment Variables Niet Ingesteld (Meest Waarschijnlijk)

**Symptomen:**
- 404 error op homepage
- Build logs tonen geen errors
- Runtime errors in Vercel logs

**Oplossing:**
1. Ga naar Vercel Dashboard
2. Selecteer je project
3. Ga naar **Settings** > **Environment Variables**
4. Voeg deze variables toe:
   - `NEXT_PUBLIC_SUPABASE_URL` = je Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = je Supabase anon key

5. **Belangrijk**: Zet beide variables op **Production**, **Preview**, en **Development**
6. **Redeploy** na het toevoegen van variables

### 2. Build Faalt

**Check:**
1. Ga naar Vercel Dashboard > **Deployments**
2. Klik op de laatste deployment
3. Check de **Build Logs** voor errors

**Mogelijke build errors:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

### 3. Output Directory Configuratie

Next.js gebruikt standaard `.next` als output directory. Vercel detecteert dit automatisch.

**Check:**
- Vercel zou automatisch moeten detecteren dat dit een Next.js project is
- Check in Vercel Settings > **General** > **Build & Development Settings**
- **Framework Preset** moet "Next.js" zijn
- **Build Command** moet `next build` zijn (of leeg)
- **Output Directory** moet leeg zijn (of `.next`)

### 4. Runtime Error

**Check Vercel Logs:**
1. Ga naar Vercel Dashboard > **Deployments**
2. Klik op de laatste deployment
3. Klik op **Functions** tab
4. Check voor runtime errors

## Stap-voor-stap Fix

### Stap 1: Verifieer Environment Variables

```bash
# Lokaal testen
# Maak .env.local met:
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Test build
npm run build
npm run start
```

### Stap 2: Check Vercel Environment Variables

1. **Vercel Dashboard** > **Project** > **Settings** > **Environment Variables**
2. Verifieer dat deze variables bestaan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check dat ze ingesteld zijn voor **alle environments** (Production, Preview, Development)

### Stap 3: Check Build Logs

1. **Vercel Dashboard** > **Deployments**
2. Klik op de laatste deployment
3. Scroll naar **Build Logs**
4. Zoek naar errors

### Stap 4: Check Runtime Logs

1. **Vercel Dashboard** > **Deployments**
2. Klik op de laatste deployment
3. Klik op **Functions** tab
4. Check voor runtime errors

### Stap 5: Redeploy

Na het fixen van environment variables:
1. Ga naar **Deployments**
2. Klik op de 3 dots (⋯) naast de laatste deployment
3. Klik op **Redeploy**
4. Of push een nieuwe commit naar GitHub

## Verificatie

Na het fixen, test deze URLs:
- ✅ `https://www.corridor.gent/` (homepage)
- ✅ `https://www.corridor.gent/evenementen`
- ✅ `https://www.corridor.gent/zones`
- ✅ `https://www.corridor.gent/partners`

## Veelvoorkomende Fouten

### Fout: "Missing Supabase environment variables"
**Oplossing**: Voeg environment variables toe in Vercel Dashboard

### Fout: Build faalt met TypeScript errors
**Oplossing**: Fix TypeScript errors lokaal, test met `npm run build`

### Fout: 404 op alle routes
**Oplossing**: Check dat `vercel.json` correct is (geen rewrites nodig voor Next.js)

### Fout: Runtime error in logs
**Oplossing**: Check de specifieke error in Vercel logs en fix de code

## Debugging Tips

### 1. Test Lokaal Eerst
```bash
npm run build
npm run start
# Open http://localhost:3000
```

### 2. Check Vercel Build Logs
- Alle errors worden getoond in build logs
- Check voor missing dependencies
- Check voor TypeScript errors

### 3. Check Vercel Runtime Logs
- Runtime errors worden getoond in Functions tab
- Check voor missing environment variables
- Check voor database connection errors

### 4. Test Environment Variables
Voeg tijdelijk logging toe om te checken of variables worden geladen:
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
```

## Snelle Fix Checklist

- [ ] Environment variables toegevoegd in Vercel Dashboard
- [ ] Variables ingesteld voor Production, Preview, en Development
- [ ] Build logs gecheckt voor errors
- [ ] Runtime logs gecheckt voor errors
- [ ] Redeploy uitgevoerd na het toevoegen van variables
- [ ] Lokaal getest met `npm run build && npm run start`

## Hulp Nodig?

Als het probleem blijft bestaan:
1. Check Vercel build logs en deel de errors
2. Check Vercel runtime logs en deel de errors
3. Verifieer dat environment variables correct zijn ingesteld
4. Test lokaal of de build werkt
