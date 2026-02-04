# Debug 404 Error op Vercel

## Stap-voor-stap Debugging

Als je nog steeds een 404 krijgt na het toevoegen van environment variables, volg deze stappen:

## 1. Check Vercel Build Logs

### Stap 1: Ga naar Build Logs
1. Vercel Dashboard → **Deployments**
2. Klik op de **laatste deployment**
3. Scroll naar **Build Logs**

### Stap 2: Zoek naar Errors
Check voor:
- ❌ "Missing Supabase environment variables"
- ❌ TypeScript errors
- ❌ Build failures
- ❌ Missing dependencies

**Deel de build logs als je errors ziet!**

## 2. Check Vercel Runtime Logs

### Stap 1: Ga naar Runtime Logs
1. Vercel Dashboard → **Deployments**
2. Klik op de **laatste deployment**
3. Klik op **Functions** tab

### Stap 2: Check voor Runtime Errors
- Klik op de functie (bijv. `/api/...` of page route)
- Check voor errors in de logs
- Check voor "Missing environment variables"

**Deel de runtime logs als je errors ziet!**

## 3. Verifieer Environment Variables

### Check in Vercel Dashboard:
1. **Settings** > **Environment Variables**
2. Verifieer dat beide variables bestaan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Check dat ze ingesteld zijn voor **Production** ✅
4. Check de **waarden** - zijn ze correct?

### Test de Values:
De values moeten zijn:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://[project-ref].supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (lang token)

## 4. Check Build Output

### Stap 1: Check Build Output
1. Vercel Dashboard → **Deployments**
2. Klik op de laatste deployment
3. Scroll naar het einde van **Build Logs**
4. Zoek naar: "Route (app)" of "Generating static pages"

**Wat zie je daar?** Zie je routes zoals:
```
Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /agenda
...
```

Of zie je errors?

## 5. Test Lokaal Met Production Build

### Stap 1: Test Lokaal
```bash
# Maak .env.local met je Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Build
npm run build

# Start production server
npm run start
```

### Stap 2: Test Lokaal
Open: `http://localhost:3000`

**Werkt het lokaal?**
- ✅ Ja → Probleem is in Vercel configuratie
- ❌ Nee → Probleem is in de code

## 6. Check Vercel Project Settings

### Stap 1: Check Framework Preset
1. Vercel Dashboard → **Settings** > **General**
2. Scroll naar **Build & Development Settings**
3. Check:
   - **Framework Preset**: Moet "Next.js" zijn
   - **Build Command**: Moet `next build` zijn (of leeg)
   - **Output Directory**: Moet leeg zijn (of `.next`)

### Stap 2: Check Root Directory
- **Root Directory**: Moet leeg zijn (of `.`)

## 7. Check voor Custom Domain Issues

### Als je een custom domain gebruikt:
1. Check **Settings** > **Domains**
2. Verifieer dat `corridor.gent` correct is geconfigureerd
3. Check DNS settings

## 8. Force Redeploy

### Stap 1: Force Redeploy
1. **Deployments** tab
2. Klik op 3 dots (⋯) naast laatste deployment
3. Klik op **Redeploy**
4. Selecteer **Use existing Build Cache**: ❌ (uncheck)
5. Klik **Redeploy**

Dit forceert een volledige rebuild.

## 9. Check voor .vercelignore Issues

Check of `.vercelignore` belangrijke bestanden uitsluit:
- Moet `app/` directory NIET uitsluiten
- Moet `components/` directory NIET uitsluiten
- Moet `lib/` directory NIET uitsluiten

## 10. Test Direct Vercel URL

Test de directe Vercel URL (niet custom domain):
- `https://[your-project].vercel.app/`

**Werkt dit?**
- ✅ Ja → Probleem is met custom domain
- ❌ Nee → Probleem is met de build/deployment

## Meest Waarschijnlijke Oorzaken

### 1. Environment Variables Niet Beschikbaar Tijdens Build
**Symptoom**: Build faalt of pagina's worden niet gegenereerd
**Oplossing**: Zorg dat variables zijn ingesteld voor **Production** environment

### 2. Build Faalt Door Runtime Error
**Symptoom**: Build logs tonen errors
**Oplossing**: Fix de errors in de build logs

### 3. Custom Domain Configuratie
**Symptoom**: Werkt op `.vercel.app` maar niet op custom domain
**Oplossing**: Check DNS en domain configuratie

### 4. Output Directory Verkeerd
**Symptoom**: Build slaagt maar geen output
**Oplossing**: Check Vercel project settings

## Wat Te Doen Nu?

1. **Deel de Build Logs** - Kopieer de laatste 50 regels van build logs
2. **Deel de Runtime Logs** - Als er errors zijn in Functions tab
3. **Test Lokaal** - Werkt `npm run build && npm run start`?
4. **Check Environment Variables** - Zijn ze correct ingesteld?

## Snelle Test

Run dit lokaal om te testen:
```bash
# Zorg dat .env.local bestaat met:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

npm run build
npm run start
# Open http://localhost:3000
```

**Werkt dit?** Dan is het probleem in Vercel configuratie.
**Werkt dit niet?** Dan is er een probleem in de code.
