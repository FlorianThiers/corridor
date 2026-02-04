# Supabase Storage Setup voor Video's

## Overzicht

De applicatie gebruikt nu Supabase Storage voor video's in plaats van Vercel's public directory. Dit bespaart Vercel bandwidth en gebruikt Supabase's CDN.

## Setup Instructies

### 1. Maak Storage Bucket in Supabase

1. Ga naar je Supabase Dashboard
2. Navigeer naar **Storage** in het menu
3. Klik op **New bucket**
4. Maak een bucket genaamd `videos`
5. Zet **Public bucket** aan (zodat video's publiek toegankelijk zijn)

### 2. Upload Video's naar Supabase Storage

#### Optie A: Via Supabase Dashboard
1. Ga naar **Storage** > **videos**
2. Klik op **Upload file**
3. Upload de volgende video's:
   - `VideoGuillaume.mp4` (Hero achtergrond video)
   - `corridorGif.mp4` (Floating GIF)
   - `AnimatieFlyer.mp4` (optioneel, voor toekomstig gebruik)

#### Optie B: Via Supabase CLI
```bash
# Installeer Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Upload video's
supabase storage upload videos VideoGuillaume.mp4
supabase storage upload videos corridorGif.mp4
supabase storage upload videos AnimatieFlyer.mp4
```

#### Optie C: Via Code (Admin Panel)
Je kunt ook een upload functionaliteit toevoegen aan het admin panel.

### 3. Maak Poster Images (Aanbevolen)

Poster images zijn statische afbeeldingen die worden getoond voordat de video laadt. Dit verbetert de UX aanzienlijk.

**Aanbevolen poster images:**
- Voor `VideoGuillaume.mp4`: Gebruik `/FlyerVoorkant.webp` (al geïmplementeerd)
- Voor `corridorGif.mp4`: Gebruik `/herfstplanning.webp` (al geïmplementeerd)
- Voor `AnimatieFlyer.mp4`: Maak een screenshot van het eerste frame

**Hoe maak je een poster image:**
```bash
# Met FFmpeg
ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 poster.webp
```

### 4. Verifieer Public URLs

Na het uploaden, controleer of de video's publiek toegankelijk zijn:

```
https://[your-project-ref].supabase.co/storage/v1/object/public/videos/VideoGuillaume.mp4
https://[your-project-ref].supabase.co/storage/v1/object/public/videos/corridorGif.mp4
```

## Componenten

### SupabaseVideo Component

Nieuwe component die video's van Supabase Storage haalt:

```tsx
<SupabaseVideo
  bucket="videos"
  fileName="VideoGuillaume.mp4"
  fallbackUrl="/VideoGuillaume.mp4" // Fallback naar local file
  className="..."
  muted
  loop
  playsInline
  preload="none"
  poster="/FlyerVoorkant.webp"
/>
```

**Props:**
- `bucket`: Supabase Storage bucket naam
- `fileName`: Specifieke file naam (optioneel, gebruikt anders laatste file)
- `fallbackUrl`: Fallback URL als Supabase Storage faalt
- `poster`: Poster image URL
- Andere standaard video props

### LazyVideo Component (Updated)

Nu ondersteunt LazyVideo ook Supabase Storage:

```tsx
<LazyVideo
  supabaseBucket="videos"
  supabaseFileName="corridorGif.mp4"
  src="/corridorGif.mp4" // Fallback
  poster="/herfstplanning.webp"
  autoPlay
  muted
  loop
/>
```

## Voordelen

### 1. Geen Vercel Bandwidth Usage
- Video's worden geserveerd via Supabase CDN
- Vercel bandwidth wordt alleen gebruikt voor HTML/CSS/JS
- Bespaart kosten op Vercel

### 2. Betere Performance
- Supabase CDN is geoptimaliseerd voor media
- Wereldwijde CDN distributie
- Snellere laadtijden

### 3. Schaalbaarheid
- Supabase Storage is schaalbaar
- Gratis tier: 1GB storage, 2GB bandwidth/maand
- Betaalde plannen voor meer

### 4. Poster Images
- Betere UX (snellere eerste indruk)
- Minder data tot video geladen is
- Betere mobile experience

## Fallback Strategie

Alle componenten hebben fallback naar local files:
- Als Supabase Storage faalt, gebruikt het `/public/` directory
- Zorgt voor betrouwbaarheid
- Video's blijven werken tijdens migratie

## Monitoring

### Supabase Dashboard
- Monitor storage usage
- Check bandwidth usage
- Bekijk file sizes

### Vercel Analytics
- Monitor of video requests naar Vercel gaan (zouden niet moeten)
- Check total bandwidth usage

## Troubleshooting

### Video's laden niet
1. Controleer of bucket `public` is
2. Controleer file namen (case-sensitive)
3. Controleer RLS policies (moeten public zijn)
4. Check browser console voor errors

### Fallback werkt niet
1. Controleer of local files bestaan in `/public/`
2. Check file paths in code

### Poster images tonen niet
1. Controleer of poster images bestaan
2. Check image paths
3. Controleer image format (WebP aanbevolen)

## Volgende Stappen

1. ✅ SupabaseVideo component gemaakt
2. ✅ LazyVideo component updated
3. ✅ HeroSection gebruikt Supabase Storage
4. ✅ CorridorGif gebruikt Supabase Storage
5. ⏳ Upload video's naar Supabase Storage
6. ⏳ Verifieer public URLs
7. ⏳ Test fallback functionaliteit
8. ⏳ Monitor bandwidth usage

## Best Practices

1. **Compress video's eerst**: Gebruik `npm run optimize:videos` voordat je upload
2. **Gebruik poster images**: Altijd poster images toevoegen
3. **Test fallbacks**: Zorg dat fallback naar local files werkt
4. **Monitor usage**: Houd Supabase storage/bandwidth in de gaten
5. **Gebruik lazy loading**: Laad video's alleen wanneer nodig
