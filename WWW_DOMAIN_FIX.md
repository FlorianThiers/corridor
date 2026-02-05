# www.corridor.gent Domain Fix

## 🔍 Probleem

Vercel URLs werken (bijv. `https://corridor-xxx.vercel.app`) maar `www.corridor.gent` werkt niet, terwijl `corridor.gent` (zonder www) waarschijnlijk wel werkt.

## ✅ Stap 1: Check Domain in Vercel Dashboard

**KRITIEK:** Dit is waarschijnlijk het probleem!

1. Ga naar **Vercel Dashboard** → Je project → **Settings** → **Domains**
2. Check of **beide** domains zijn toegevoegd:
   - ✅ `corridor.gent` (zonder www)
   - ❓ `www.corridor.gent` (met www) - **Check of deze bestaat!**

### Als `www.corridor.gent` ontbreekt:

1. Klik op **"Add Domain"** of **"Add"**
2. Voer `www.corridor.gent` in
3. Volg de DNS instructies die Vercel geeft
4. Wacht tot het domain **"Valid Configuration"** toont (groene vinkje)

### Als `www.corridor.gent` wel bestaat maar niet werkt:

1. Check de **status** van het domain:
   - ✅ **"Valid Configuration"** (groen) = DNS is correct
   - ⚠️ **"Invalid Configuration"** (rood) = DNS probleem
   - ⏳ **"Pending"** = Wacht op DNS propagation

2. Als status **"Invalid Configuration"** is:
   - Klik op het domain
   - Check de **DNS Configuration** instructies
   - Verifieer dat je DNS records correct zijn ingesteld

## ✅ Stap 2: Check DNS Records

Voor `www.corridor.gent` heb je een **CNAME record** nodig:

### DNS Record voor www subdomain:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**OF** (afhankelijk van je DNS provider):

```
Type: CNAME
Name: www.corridor.gent
Value: cname.vercel-dns.com
```

### Verifieer DNS:

Test of DNS correct is geconfigureerd:

```bash
# Windows PowerShell
nslookup www.corridor.gent

# Of gebruik online tool:
# https://dnschecker.org/#CNAME/www.corridor.gent
```

**Verwachte output:**
- Moet verwijzen naar `cname.vercel-dns.com` of een Vercel IP

## ✅ Stap 3: Check Redirect Configuratie

Je hebt al een redirect in `next.config.js`:

```js
async redirects() {
  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.corridor.gent',
        },
      ],
      destination: 'https://corridor.gent/:path*',
      permanent: true,
    },
  ]
}
```

**Dit zou moeten werken**, maar alleen als:
1. `www.corridor.gent` is toegevoegd in Vercel
2. DNS is correct geconfigureerd
3. Domain heeft "Valid Configuration" status

## ✅ Stap 4: Alternatief - Vercel-Level Redirect

Als Next.js redirect niet werkt, kunnen we een Vercel-level redirect toevoegen in `vercel.json`:

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

**Maar eerst:** Probeer Stap 1 en 2 - dit is meestal een DNS/domain configuratie probleem.

## ✅ Stap 5: Force Redeploy

Na het toevoegen/configureren van het www domain:

1. Ga naar **Deployments** tab
2. Klik op **3 dots (⋯)** naast laatste deployment
3. Klik op **Redeploy**
4. **UNCHECK** "Use existing Build Cache"
5. Klik **Redeploy**

## 🔍 Stap 6: Test

Na redeploy, test deze URLs:

1. **Direct Vercel URL:** `https://[project-name].vercel.app`
   - ✅ Werkt dit? → Framework is correct

2. **Non-www domain:** `https://corridor.gent`
   - ✅ Werkt dit? → Domain configuratie is correct

3. **www domain:** `https://www.corridor.gent`
   - ✅ Werkt dit? → Alles is correct!
   - ❌ Werkt niet? → Zie Stap 7

## 🚨 Stap 7: Als www.corridor.gent Nog Steeds Niet Werkt

### Check 1: DNS Propagation

DNS wijzigingen kunnen 24-48 uur duren om te propageren:

1. Gebruik https://dnschecker.org om te checken of DNS wereldwijd is gepropageerd
2. Voer `www.corridor.gent` in
3. Check of alle locaties `cname.vercel-dns.com` tonen

### Check 2: Browser Cache

1. Clear browser cache
2. Test in incognito/private mode
3. Test in verschillende browsers

### Check 3: Vercel Logs

1. Ga naar **Deployments** → Laatste deployment → **Functions**
2. Check voor errors wanneer je `www.corridor.gent` bezoekt
3. Check **Analytics** → **Requests** voor www domain requests

### Check 4: SSL Certificate

1. Check of SSL certificate is uitgegeven voor `www.corridor.gent`
2. Vercel Dashboard → Settings → Domains → `www.corridor.gent`
3. Check SSL status (moet "Valid" zijn)

## 💡 Meest Waarschijnlijke Oorzaken

**90% kans:**
1. `www.corridor.gent` is **niet toegevoegd** in Vercel Dashboard
2. DNS record voor www subdomain is **niet geconfigureerd**
3. DNS heeft nog niet gepropageerd (kan 24-48 uur duren)

**10% kans:**
1. SSL certificate is nog niet uitgegeven voor www subdomain
2. Vercel heeft www domain niet correct gekoppeld aan project

## 📋 Checklist

- [ ] `www.corridor.gent` is toegevoegd in Vercel Dashboard
- [ ] Domain status is "Valid Configuration" (groene vinkje)
- [ ] DNS CNAME record is geconfigureerd voor www subdomain
- [ ] DNS verwijst naar `cname.vercel-dns.com`
- [ ] DNS is gepropageerd (check met dnschecker.org)
- [ ] SSL certificate is uitgegeven voor www subdomain
- [ ] Redeploy uitgevoerd na domain toevoeging
- [ ] Test in incognito mode (geen cache)
- [ ] Test verschillende browsers

## 🔧 Wat We Hebben in Code

✅ `next.config.js` - Redirect van www naar non-www (zou moeten werken als domain is toegevoegd)

Het probleem zit waarschijnlijk in **Vercel Dashboard domain configuratie**, niet in de code!
