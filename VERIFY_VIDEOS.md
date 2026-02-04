# Video Verificatie Guide

## ✅ Video's zijn geüpload naar Supabase Storage

Nu de video's in de bucket staan, volg deze stappen om te verifiëren dat alles werkt:

## 1. Verifieer Bucket Configuratie

### In Supabase Dashboard:
1. Ga naar **Storage** > **videos**
2. Controleer dat de bucket **Public** is (niet Private)
3. Controleer dat deze video's aanwezig zijn:
   - `VideoGuillaume.mp4`
   - `corridorGif.mp4`
   - `AnimatieFlyer.mp4` (optioneel)

## 2. Test Public URLs

Open deze URLs in je browser om te verifiëren dat ze werken:

```
https://[your-project-ref].supabase.co/storage/v1/object/public/videos/VideoGuillaume.mp4
https://[your-project-ref].supabase.co/storage/v1/object/public/videos/corridorGif.mp4
```

**Vervang `[your-project-ref]` met je Supabase project reference.**

Je kunt je project reference vinden in:
- Supabase Dashboard > Settings > API > Project URL

## 3. Test Lokaal

### Start de development server:
```bash
npm run dev
```

### Test de volgende pagina's:

1. **Homepage (`/`)**:
   - Scroll naar beneden of klik ergens
   - Hero video (`VideoGuillaume.mp4`) zou moeten laden
   - Check browser console voor errors

2. **History Section**:
   - Scroll naar de "Het Verhaal van Corridor" sectie
   - Floating GIF (`corridorGif.mp4`) zou moeten laden wanneer het in viewport komt
   - Check browser console voor errors

### Browser Console Check:
Open Developer Tools (F12) en check:
- **Network tab**: Kijk of video requests naar Supabase gaan (niet naar Vercel)
- **Console tab**: Check voor errors
- **Video elementen**: Rechts-klik op video > Inspect > Check `src` attribute

## 4. Verifieer File Namen

**Belangrijk**: File namen zijn case-sensitive!

Controleer dat de file namen in de code exact overeenkomen met de file namen in Supabase:

### In Code:
- `components/HeroSection.tsx`: `fileName="VideoGuillaume.mp4"`
- `app/page.tsx`: `supabaseFileName="corridorGif.mp4"`

### In Supabase Storage:
- Moet exact zijn: `VideoGuillaume.mp4` (niet `videoguillaume.mp4`)
- Moet exact zijn: `corridorGif.mp4` (niet `CorridorGif.mp4`)

## 5. Test Fallback Functionaliteit

Om te testen of fallback werkt:

1. **Tijdelijk bucket private maken** (of file verwijderen)
2. Video zou moeten fallback naar local file (`/VideoGuillaume.mp4`)
3. **Herstel bucket naar public**

## 6. Check Poster Images

Verifieer dat poster images bestaan:
- `/FlyerVoorkant.webp` (voor Hero video)
- `/herfstplanning.webp` (voor corridorGif)

Poster images worden getoond voordat video's laden.

## 7. Performance Check

### Network Tab Analysis:
1. Open Developer Tools > Network
2. Filter op "Media"
3. Check:
   - Video's worden geladen van Supabase URL (niet Vercel)
   - Lazy loading werkt (video's laden alleen wanneer nodig)
   - Poster images worden eerst getoond

### Expected Behavior:
- **Homepage load**: Alleen poster image, geen video
- **User interaction**: Hero video begint te laden
- **Scroll naar history**: CorridorGif begint te laden wanneer in viewport

## Troubleshooting

### Video's laden niet:
1. ✅ Check bucket is **Public**
2. ✅ Check file namen zijn exact (case-sensitive)
3. ✅ Check browser console voor errors
4. ✅ Verifieer public URLs werken in browser
5. ✅ Check RLS policies (moeten public zijn)

### Video's laden van Vercel (niet Supabase):
1. Check browser console voor errors
2. Check Network tab - waar komen requests vandaan?
3. Verifieer Supabase client is correct geconfigureerd
4. Check environment variables zijn ingesteld

### Fallback werkt niet:
1. Check local files bestaan in `/public/`
2. Check file paths in code
3. Test local files direct: `http://localhost:3000/VideoGuillaume.mp4`

### Poster images tonen niet:
1. Check poster images bestaan in `/public/`
2. Check image paths in code
3. Test images direct: `http://localhost:3000/FlyerVoorkant.webp`

## Success Indicators

✅ Video's laden van Supabase URLs (niet Vercel)
✅ Poster images worden getoond voordat video's laden
✅ Lazy loading werkt (video's laden alleen wanneer nodig)
✅ Geen errors in browser console
✅ Video's spelen correct af
✅ Fallback werkt als Supabase faalt

## Volgende Stappen

Na verificatie:
1. ✅ Test in productie (na deploy naar Vercel)
2. ✅ Monitor Supabase Storage usage
3. ✅ Monitor Vercel bandwidth (zou 0 MB moeten zijn voor video's)
4. ✅ Overweeg video compressie voor kleinere bestanden

## Hulp Nodig?

Als video's niet werken:
1. Check browser console voor specifieke errors
2. Verifieer Supabase Storage bucket configuratie
3. Test public URLs direct in browser
4. Check file namen en paths
