# Data Transfer Optimalisatie - Corridor Website

## 🎯 Probleem
De Corridor website verbruikt **53.17 GB (89.3%)** van de Vercel data transfer limiet, voornamelijk door:
- Grote video bestanden zonder caching
- Grote afbeeldingen zonder optimalisatie
- Geen caching headers geconfigureerd

## ✅ Geïmplementeerde Oplossingen

### 1. Caching Headers (`vercel.json`)
- **Video's** (mp4, webm, mov): `Cache-Control: public, max-age=31536000, immutable` (1 jaar)
- **Afbeeldingen** (jpg, png, gif, webp, svg): `Cache-Control: public, max-age=31536000, immutable` (1 jaar)
- **PDF's**: `Cache-Control: public, max-age=86400` (1 dag)
- **JavaScript**: `Cache-Control: public, max-age=31536000, immutable` (1 jaar)
- **HTML pagina's**: `Cache-Control: public, max-age=3600` (1 uur)

### 2. Video Optimalisatie
- **preload="metadata"** in plaats van "none" - laadt alleen metadata, niet de volledige video
- **loading="lazy"** attribuut toegevoegd aan video elementen
- **Accept-Ranges: bytes** header voor video streaming

### 3. Lazy Loading Verbeteringen
- Alle video's hebben nu `preload="metadata"` en `loading="lazy"`
- Achtergrondafbeeldingen hebben `loading="lazy"` attribuut

## 📊 Verwacht Resultaat

### Voor Optimalisatie:
- Elke bezoeker downloadt alle video's opnieuw
- Geen browser caching
- **~10-50MB per bezoek** (afhankelijk van video grootte)

### Na Optimalisatie:
- **Eerste bezoek**: ~10-50MB (zoals voorheen)
- **Herhaalde bezoeken**: ~100KB-1MB (alleen HTML/JS, geen video's/afbeeldingen)
- **Geschatte besparing**: **80-95%** data transfer reductie

## 🔄 Volgende Stappen (Optioneel)

### 1. Video Compressie
Comprimeer video's om de bestandsgrootte te verminderen:
```bash
# Gebruik HandBrake of FFmpeg
ffmpeg -i VideoGuillaume.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k VideoGuillaume-compressed.mp4
```

### 2. WebP Afbeeldingen
Converteer PNG/JPG naar WebP voor betere compressie:
- `FlyerVoorkant.png` → `FlyerVoorkant.webp`
- `FlyerAchterkant.png` → `FlyerAchterkant.webp`
- `LogoCorridor.png` → `LogoCorridor.webp`

### 3. Responsive Images
Gebruik `srcset` voor verschillende schermformaten:
```html
<img srcset="image-small.webp 480w, image-medium.webp 768w, image-large.webp 1200w"
     sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
     src="image-large.webp" alt="...">
```

### 4. CDN voor Video's
Overweeg video's te hosten op:
- **YouTube** (gratis, goede compressie)
- **Vimeo** (professioneel)
- **Cloudflare Stream** (betaald, maar zeer efficiënt)

## 📈 Monitoring

Controleer na deployment:
1. Vercel Dashboard → Analytics → Data Transfer
2. Browser DevTools → Network tab (check caching headers)
3. Google PageSpeed Insights (performance score)

## ⚠️ Belangrijk

Na deze optimalisaties:
- **Eerste bezoekers** zullen nog steeds de volledige bestanden downloaden
- **Herhaalde bezoekers** zullen veel minder data gebruiken
- **Nieuwe bezoekers** profiteren na de eerste keer van caching

De volledige impact zal pas zichtbaar zijn na enkele dagen/weken wanneer bezoekers terugkeren.
