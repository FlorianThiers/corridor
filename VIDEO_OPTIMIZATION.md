# Video Optimalisatie voor Vercel

## Huidige Situatie

De applicatie gebruikt 3 video's:
- **VideoGuillaume.mp4**: 7.49 MB (Hero achtergrond)
- **corridorGif.mp4**: 8.74 MB (Floating GIF)
- **AnimatieFlyer.mp4**: 3.41 MB (Niet gebruikt in code)
- **Totaal**: ~19.64 MB

## Geïmplementeerde Optimalisaties

### 1. Lazy Loading met Intersection Observer

**LazyVideo Component** (`components/LazyVideo.tsx`):
- Video's worden alleen geladen wanneer ze bijna in viewport komen
- Gebruikt `rootMargin: '50px'` voor preloading
- Toont poster image tot video geladen is
- Voorkomt onnodige downloads

**Gebruik:**
```tsx
<LazyVideo
  src="/corridorGif.mp4"
  autoPlay
  muted
  loop
  playsInline
  poster="/poster.webp" // Optioneel
/>
```

### 2. Hero Section Video Optimalisatie

**HeroSection** (`components/HeroSection.tsx`):
- `preload="none"` - Video wordt niet vooraf geladen
- Laadt alleen op user interaction (click, touch, scroll)
- Poster image als fallback
- Video blijft verborgen tot geladen

### 3. Intro Animation (Supabase Storage)

**IntroAnimation** (`components/IntroAnimation.tsx`):
- Video wordt opgehaald van Supabase Storage
- Gebruikt CDN van Supabase (niet Vercel bandwidth)
- Al geoptimaliseerd!

### 4. Vercel Caching Headers

**vercel.json**:
- Video's hebben `Cache-Control: public, max-age=31536000, immutable`
- `Accept-Ranges: bytes` voor range requests (streaming)
- Video's worden gecached door browser/CDN

## Aanbevolen Optimalisaties

### 1. Video Compressie

Gebruik het bestaande script om video's te comprimeren:

```powershell
npm run optimize:videos
```

Of handmatig met FFmpeg:
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4
```

**Verwachte besparing**: 50-70% kleiner bestand

### 2. Video's naar Supabase Storage Verplaatsen

**Voordelen:**
- Geen Vercel bandwidth usage
- CDN van Supabase
- Betere performance wereldwijd
- Gratis tier heeft 1GB storage

**Implementatie:**
1. Upload video's naar Supabase Storage bucket
2. Update componenten om public URL te gebruiken
3. Zelfde als IntroAnimation component

### 3. WebM Format Toevoegen

WebM is vaak kleiner dan MP4. Voeg beide formats toe:

```tsx
<video>
  <source src="/video.webm" type="video/webm" />
  <source src="/video.mp4" type="video/mp4" />
</video>
```

### 4. Poster Images

Voeg poster images toe voor betere UX:
- Snellere eerste indruk
- Minder data tot video geladen is
- Betere mobile experience

### 5. Responsive Video Quality

Gebruik verschillende video kwaliteiten voor verschillende schermen:
- Mobile: 480p
- Tablet: 720p
- Desktop: 1080p

## Bandwidth Schatting

### Zonder Optimalisatie:
- **Elke page load**: ~19.64 MB
- **100 page loads**: ~1.96 GB
- **1000 page loads**: ~19.6 GB

### Met Lazy Loading:
- **Homepage load**: ~7.49 MB (alleen hero video)
- **Scroll naar history**: +8.74 MB (corridorGif)
- **100 page loads**: ~1.62 GB (als 50% scrollt)
- **Besparing**: ~17% minder bandwidth

### Met Compressie (50% kleiner):
- **Homepage load**: ~3.75 MB
- **100 page loads**: ~0.81 GB
- **Besparing**: ~59% minder bandwidth

### Met Supabase Storage:
- **Vercel bandwidth**: 0 MB (video's van Supabase CDN)
- **Supabase bandwidth**: Gratis tier heeft 2GB/maand
- **Besparing**: 100% Vercel bandwidth voor video's

## Best Practices

1. **Gebruik LazyVideo component** voor alle video's
2. **Compress video's** voor productie
3. **Gebruik poster images** voor betere UX
4. **Overweeg Supabase Storage** voor grote video's
5. **Monitor bandwidth** in Vercel dashboard
6. **Test op mobile** - mobile data is duurder

## Monitoring

### Vercel Analytics
- Monitor bandwidth usage
- Check welke assets het meest worden gedownload
- Identificeer optimalisatie kansen

### Supabase Dashboard
- Monitor storage usage
- Check bandwidth usage
- Upgrade plan indien nodig

## Volgende Stappen

1. ✅ Lazy loading geïmplementeerd
2. ⏳ Video compressie uitvoeren
3. ⏳ Poster images toevoegen
4. ⏳ Overweeg Supabase Storage voor grote video's
5. ⏳ WebM format toevoegen (optioneel)
