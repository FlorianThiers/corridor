# Quick Fix voor 404 Error op Vercel

## 🚨 Snelle Oplossing

De 404 error wordt waarschijnlijk veroorzaakt door **missing environment variables** in Vercel.

### Stap 1: Voeg Environment Variables Toe in Vercel

1. Ga naar **Vercel Dashboard**: https://vercel.com/dashboard
2. Selecteer je project **corridor.gent**
3. Ga naar **Settings** > **Environment Variables**
4. Klik op **Add New**
5. Voeg deze 2 variables toe:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://[your-project-ref].supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `[your-anon-key]`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

6. Klik op **Save**

### Stap 2: Redeploy

1. Ga naar **Deployments** tab
2. Klik op de 3 dots (⋯) naast de laatste deployment
3. Klik op **Redeploy**
4. Wacht tot deployment klaar is

### Stap 3: Test

Open: https://www.corridor.gent/

De pagina zou nu moeten werken!

## 🔍 Waar Vind Je Je Supabase Credentials?

1. Ga naar **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecteer je project
3. Ga naar **Settings** > **API**
4. Je vindt daar:
   - **Project URL** → Dit is je `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Dit is je `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Belangrijk

- Zorg dat beide variables zijn ingesteld voor **alle environments** (Production, Preview, Development)
- Na het toevoegen van variables, **moet je redeployen**
- Variables met `NEXT_PUBLIC_` prefix zijn zichtbaar in de browser (dat is normaal voor Supabase)
- **Vercel waarschuwing over anon key**: Je kunt deze veilig negeren - de Supabase anon key is bedoeld om publiek te zijn (zie `SUPABASE_SECURITY.md`)

## 🐛 Als Het Nog Steeds Niet Werkt

1. Check **Vercel Build Logs**:
   - Ga naar Deployments > Laatste deployment > Build Logs
   - Zoek naar errors

2. Check **Vercel Runtime Logs**:
   - Ga naar Deployments > Laatste deployment > Functions tab
   - Check voor runtime errors

3. Test Lokaal:
   ```bash
   # Maak .env.local met je Supabase credentials
   npm run build
   npm run start
   # Open http://localhost:3000
   ```

4. Deel de errors met mij als het nog steeds niet werkt!
