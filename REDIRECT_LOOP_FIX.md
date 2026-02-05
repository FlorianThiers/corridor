# Redirect Loop Fix

## 🔍 Probleem

"Firefox has detected that the server is redirecting the request for this address in a way that will never complete."

Dit betekent dat er een **redirect loop** is tussen `corridor.gent` en `www.corridor.gent`.

## ✅ Fix 1: Dubbele Redirects Verwijderd

**Probleem:** Er waren redirects op TWEE plekken:
1. ❌ `next.config.js` - redirect van www naar non-www
2. ✅ `vercel.json` - redirect van www naar non-www

**Oplossing:** Next.js redirect verwijderd, alleen Vercel-level redirect behouden.

## ✅ Fix 2: Check Vercel Domain Settings

**Mogelijk probleem:** Vercel heeft mogelijk automatische redirects ingesteld die conflicteren.

1. Ga naar **Vercel Dashboard** → Project → **Settings** → **Domains**
2. Check beide domains:
   - `corridor.gent`
   - `www.corridor.gent`
3. **Belangrijk:** Beide domains moeten **geen automatische redirects** hebben ingesteld
4. Als er een "Redirect to" optie is, laat deze **LEEG**

## ✅ Fix 3: Check DNS Configuration

**Mogelijk probleem:** DNS records kunnen conflicteren.

### Correcte DNS Setup:

**Voor `corridor.gent` (root domain):**
```
Type: A
Name: @
Value: [Vercel IP addresses]
```

**OF**

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Voor `www.corridor.gent` (subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**BELANGRIJK:** 
- Beide domains moeten naar **Vercel** verwijzen
- **NIET** naar elkaar verwijzen
- **NIET** naar verschillende IPs verwijzen

## ✅ Fix 4: Verifieer Redirect Configuratie

Na de fix zou je alleen deze redirect moeten hebben:

**`vercel.json`:**
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "www.corridor.gent"
        }
      ],
      "destination": "https://corridor.gent/:path*",
      "permanent": true
    }
  ]
}
```

**`next.config.js`:**
- **GEEN** redirects (verwijderd)

## ✅ Stap 5: Force Redeploy

Na het fixen:

1. **Commit en push** de wijzigingen
2. Ga naar **Vercel Dashboard** → **Deployments**
3. Klik op **3 dots (⋯)** → **Redeploy**
4. **UNCHECK** "Use existing Build Cache"
5. Klik **Redeploy**

## 🔍 Stap 6: Test

Na redeploy, test deze URLs:

1. **`https://corridor.gent`** (zonder www)
   - ✅ Moet de website tonen (geen redirect)
   - ❌ Als het nog steeds een loop is, zie Stap 7

2. **`https://www.corridor.gent`** (met www)
   - ✅ Moet redirecten naar `https://corridor.gent` (301 redirect)
   - ❌ Als het een loop is, zie Stap 7

## 🚨 Stap 7: Als Het Nog Steeds Niet Werkt

### Check 1: Vercel Automatic Redirects

Vercel kan automatische redirects hebben ingesteld:

1. Ga naar **Settings** → **Domains**
2. Klik op `corridor.gent`
3. Check of er een **"Redirect to"** veld is
4. Als dit is ingesteld, **verwijder het** (laat leeg)

5. Klik op `www.corridor.gent`
6. Check of er een **"Redirect to"** veld is
7. Als dit is ingesteld, **verwijder het** (laat leeg)

### Check 2: Browser Cache

1. **Clear browser cache** volledig
2. Test in **incognito/private mode**
3. Test in **andere browser** (Chrome, Firefox, Edge)

### Check 3: DNS Check

Test of DNS correct is:

```bash
# Check corridor.gent
nslookup corridor.gent

# Check www.corridor.gent
nslookup www.corridor.gent
```

Beide moeten naar Vercel verwijzen, niet naar elkaar.

### Check 4: Vercel Logs

1. Ga naar **Deployments** → Laatste deployment → **Functions**
2. Check voor errors wanneer je `corridor.gent` bezoekt
3. Check **Analytics** → **Requests** voor redirect patterns

## 💡 Meest Waarschijnlijke Oorzaak

**90% kans:**
1. Vercel heeft automatische redirect ingesteld in Domain Settings
2. DNS records verwijzen naar elkaar in plaats van naar Vercel
3. Browser cache toont oude redirects

**10% kans:**
1. Dubbele redirects in code (nu gefixed)
2. Vercel edge configuratie conflict

## 📋 Checklist

- [ ] Next.js redirect verwijderd (✅ gedaan)
- [ ] Alleen Vercel redirect in `vercel.json` (✅ gedaan)
- [ ] Geen "Redirect to" ingesteld in Vercel Domain Settings
- [ ] DNS records verwijzen naar Vercel (niet naar elkaar)
- [ ] Beide domains zijn toegevoegd in Vercel
- [ ] Redeploy uitgevoerd zonder cache
- [ ] Browser cache gecleared
- [ ] Test in incognito mode
- [ ] Test verschillende browsers

## 🔧 Wat We Hebben Gefixed

✅ `next.config.js` - Redirect verwijderd (was dubbel)
✅ `vercel.json` - Redirect behouden (Vercel-level heeft prioriteit)

**Volgende stap:** Check Vercel Domain Settings voor automatische redirects!
