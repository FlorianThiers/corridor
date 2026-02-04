# Cleanup Guide - Oude Bestanden

Na de migratie naar Next.js kunnen de volgende bestanden/directories worden verwijderd:

## ⚠️ Belangrijk: Maak eerst een backup!

Voordat je bestanden verwijdert, zorg ervoor dat je een backup hebt gemaakt.

## Bestanden die verwijderd kunnen worden:

### HTML Pages (vervangen door Next.js pages)
- `index.html` → Vervangen door `app/layout.tsx` + `app/page.tsx`
- `pages/*.html` → Vervangen door `app/*/page.tsx`

### JavaScript Files (vervangen door TypeScript)
- `js/auth.js` → Vervangen door `lib/auth.ts` + `hooks/useAuth.ts`
- `js/database.js` → Vervangen door `lib/database.ts`
- `js/navigation.js` → Vervangen door `components/Navigation.tsx`
- `js/router.js` → Vervangen door Next.js App Router
- `js/supabase-config.js` → Vervangen door `lib/supabase/client.ts` + `lib/supabase/server.ts`

### Server Files
- `server.js` → Next.js heeft zijn eigen server (gebruik `npm run dev` of `npm run start`)

### CSS Files (vervangen door Tailwind + globals.css)
- `css/styles.css` → Vervangen door `app/globals.css` + Tailwind
- `src/*.css` → Vervangen door Tailwind classes

### Build Scripts (niet meer nodig)
- `scripts/build-css.js` → Tailwind wordt automatisch gebouwd door Next.js
- `scripts/watch-css.js` → Next.js heeft hot reload
- `scripts/build-config.js` → Niet meer nodig

### Config Files (vervangen door Next.js config)
- `firebase.json` → Niet meer nodig (gebruik Vercel)
- `nginx.conf` → Niet meer nodig (Vercel handelt dit af)
- `_redirects` → Vervangen door Next.js rewrites in `next.config.js` (indien nodig)

## Bestanden die BEHOUDEN moeten worden:

### Public Assets
- `public/` directory → **BEHOUDEN** (alle assets blijven nodig)

### Config Files
- `package.json` → **BEHOUDEN** (aangepast voor Next.js)
- `tailwind.config.js` → **BEHOUDEN** (gebruikt door Next.js)
- `tsconfig.json` → **BEHOUDEN** (TypeScript config)
- `next.config.js` → **BEHOUDEN** (Next.js config)
- `vercel.json` → **BEHOUDEN** (deployment config)
- `.gitignore` → **BEHOUDEN**

### Documentation
- `README.md` → **BEHOUDEN** (update indien nodig)
- `MIGRATION_NOTES.md` → **BEHOUDEN** (nieuw bestand)
- `CLEANUP_GUIDE.md` → **BEHOUDEN** (dit bestand)

### Scripts (optioneel behouden)
- `scripts/optimize-videos.ps1` → **OPTIONEEL** (kan nog nuttig zijn)
- `scripts/convert-to-webp.ps1` → **OPTIONEEL** (kan nog nuttig zijn)
- `scripts/optimize-videos.sh` → **OPTIONEEL** (kan nog nuttig zijn)

## Cleanup Commando's (PowerShell)

```powershell
# Verwijder oude HTML pages
Remove-Item -Path "index.html" -Force
Remove-Item -Path "pages" -Recurse -Force

# Verwijder oude JavaScript files
Remove-Item -Path "js" -Recurse -Force

# Verwijder oude server file
Remove-Item -Path "server.js" -Force

# Verwijder oude CSS files
Remove-Item -Path "css" -Recurse -Force
Remove-Item -Path "src" -Recurse -Force

# Verwijder oude build scripts
Remove-Item -Path "scripts\build-css.js" -Force
Remove-Item -Path "scripts\watch-css.js" -Force
Remove-Item -Path "scripts\build-config.js" -Force

# Verwijder oude config files
Remove-Item -Path "firebase.json" -Force
Remove-Item -Path "nginx.conf" -Force
Remove-Item -Path "_redirects" -Force
```

## Na Cleanup

1. Test de applicatie: `npm run dev`
2. Controleer of alle routes werken
3. Test admin functionaliteit
4. Build voor productie: `npm run build`
5. Deploy naar Vercel

## Opmerkingen

- De `public/backup/` directory kan ook verwijderd worden als je zeker weet dat alle assets correct zijn gemigreerd
- Oude optimization scripts kunnen behouden blijven als je ze nog gebruikt voor asset optimalisatie
