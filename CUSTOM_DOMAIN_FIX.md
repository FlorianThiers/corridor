# Custom Domain 404 Fix

## ✅ Build is Succesvol!

Je build logs tonen dat alles correct is gebouwd:
- ✅ Alle routes zijn gegenereerd
- ✅ Build is succesvol voltooid
- ✅ Deployment is voltooid

Als je nog steeds een 404 krijgt, is het waarschijnlijk een **custom domain** of **runtime** probleem.

## 🔍 Stap 1: Test Direct Vercel URL

**Belangrijk**: Test eerst de directe Vercel URL (niet custom domain)

1. Ga naar Vercel Dashboard → **Deployments**
2. Klik op de laatste deployment
3. Kopieer de **URL** (bijv. `https://corridor-xxx.vercel.app`)
4. Open deze URL in je browser

**Werkt dit?**
- ✅ **Ja** → Probleem is met custom domain (`corridor.gent`)
- ❌ **Nee** → Probleem is met runtime (zie Stap 2)

## 🔍 Stap 2: Check Runtime Logs

Als de directe Vercel URL ook niet werkt:

1. Vercel Dashboard → **Deployments**
2. Klik op de laatste deployment
3. Klik op **Functions** tab
4. Klik op de functie voor `/` (homepage)
5. Check voor **runtime errors**

**Wat zoek je:**
- ❌ "Missing Supabase environment variables"
- ❌ Andere runtime errors
- ❌ Stack traces

## 🔍 Stap 3: Check Custom Domain Configuratie

Als de directe Vercel URL **wel** werkt maar `corridor.gent` niet:

### Check Domain Settings:
1. Vercel Dashboard → **Settings** → **Domains**
2. Check dat `corridor.gent` is toegevoegd
3. Check dat `www.corridor.gent` is toegevoegd (als je die gebruikt)
4. Check de **DNS Configuration**

### Check DNS:
De DNS records moeten zijn:
- **Type**: CNAME of A
- **Name**: `@` of `www` (afhankelijk van je DNS provider)
- **Value**: `cname.vercel-dns.com` of Vercel IP

### Verifieer DNS:
```bash
# Test DNS resolution
nslookup corridor.gent
# Of
dig corridor.gent
```

## 🔍 Stap 4: Check Environment Variables voor Production

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Check dat beide variables zijn ingesteld voor **Production** ✅
3. **Belangrijk**: Variables moeten zijn ingesteld voor **Production** environment

### Verifieer Values:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://[project-ref].supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (lange token)

## 🔍 Stap 5: Force Redeploy

Na het checken/fixen van bovenstaande:

1. **Deployments** tab
2. Klik op 3 dots (⋯) naast laatste deployment
3. Klik op **Redeploy**
4. **Uncheck** "Use existing Build Cache"
5. Klik **Redeploy**

## 🚨 Meest Waarschijnlijke Oorzaken

### 1. Custom Domain DNS Niet Correct
**Symptoom**: Werkt op `.vercel.app` maar niet op `corridor.gent`
**Oplossing**: Fix DNS configuratie

### 2. Environment Variables Niet voor Production
**Symptoom**: Build werkt maar runtime faalt
**Oplossing**: Zorg dat variables zijn ingesteld voor **Production** ✅

### 3. Runtime Error
**Symptoom**: Build werkt maar pagina crasht tijdens render
**Oplossing**: Check runtime logs en fix errors

## 📋 Snelle Checklist

- [ ] Direct Vercel URL getest (`.vercel.app`)
- [ ] Werkt direct Vercel URL? (ja/nee)
- [ ] Custom domain DNS gecheckt
- [ ] Environment variables voor Production ✅
- [ ] Runtime logs gecheckt
- [ ] Redeploy uitgevoerd

## 💬 Deel Dit

Als het nog steeds niet werkt, deel:
1. **Werkt het op `.vercel.app` URL?** (ja/nee)
2. **Runtime logs** (als er errors zijn)
3. **DNS configuratie** (welke records heb je?)
4. **Custom domain status** in Vercel Dashboard
