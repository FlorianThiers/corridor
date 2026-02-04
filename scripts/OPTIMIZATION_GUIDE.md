# 🚀 Optimalisatie Gids - Corridor Website

Deze gids helpt je om de bestanden van de Corridor website te optimaliseren voor minimale data transfer.

## 📊 Huidige Situatie

**Grootste bestanden:**
- `corridorGif.mp4`: 46 MB
- `AnimatieFlyer.mp4`: 43.22 MB  
- `VideoGuillaume.mp4`: 11.32 MB
- **Totaal video's: ~100 MB**

## 🎯 Optimalisatie Stappen

### Stap 1: Video Compressie

**Windows (PowerShell):**
```powershell
npm run optimize:videos
```

**Of handmatig:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/optimize-videos.ps1
```

**Vereisten:**
- Installeer FFmpeg: https://ffmpeg.org/download.html
- Of gebruik: `winget install ffmpeg`

**Wat gebeurt er:**
- Video's worden gecomprimeerd met H.264 codec
- CRF 28 (goede balans tussen kwaliteit en grootte)
- Geschatte reductie: **50-70%** (46MB → ~15-20MB)
- Backups worden opgeslagen in `public/backup/`

**Na compressie:**
- Review de `-compressed.mp4` bestanden
- Als tevreden, vervang originals:
  ```powershell
  Move-Item public\VideoGuillaume-compressed.mp4 public\VideoGuillaume.mp4 -Force
  Move-Item public\corridorGif-compressed.mp4 public\corridorGif.mp4 -Force
  Move-Item public\AnimatieFlyer-compressed.mp4 public\AnimatieFlyer.mp4 -Force
  ```

### Stap 2: WebP Conversie

**Windows (PowerShell):**
```powershell
npm run optimize:images
```

**Of handmatig:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/convert-to-webp.ps1
```

**Vereisten:**
- ImageMagick: https://imagemagick.org/script/download.php
- Of WebP tools: https://developers.google.com/speed/webp/download
- Of gebruik online tool: https://squoosh.app/

**Wat gebeurt er:**
- PNG en JPG worden geconverteerd naar WebP
- Quality 85 (goede balans)
- Geschatte reductie: **25-35%** voor PNG, **10-20%** voor JPG
- Backups worden opgeslagen in `public/backup/`

**Na conversie:**
- HTML is al aangepast om WebP te gebruiken met PNG/JPG fallback
- Geen verdere actie nodig!

### Stap 3: Alles Optimaliseren

```powershell
npm run optimize:all
```

Dit voert beide optimalisaties achter elkaar uit.

## 📈 Verwacht Resultaat

### Voor Optimalisatie:
- **Video's**: ~100 MB
- **Afbeeldingen**: ~0.5 MB
- **Totaal eerste bezoek**: ~100 MB

### Na Optimalisatie:
- **Video's**: ~30-40 MB (60-70% reductie)
- **Afbeeldingen**: ~0.3 MB (30% reductie)
- **Totaal eerste bezoek**: ~30-40 MB
- **Herhaalde bezoeken**: ~100KB-1MB (caching)

### Totale Besparing:
- **Eerste bezoek**: 60-70% minder data
- **Herhaalde bezoeken**: 99% minder data (door caching)

## 🔍 Verificatie

### Check bestandsgroottes:
```powershell
Get-ChildItem -Path "public" -File | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB, 2)}} | Sort-Object "Size(MB)" -Descending
```

### Test in browser:
1. Open DevTools → Network tab
2. Herlaad pagina
3. Check of WebP bestanden worden geladen
4. Check Cache-Control headers

### Vercel Analytics:
- Monitor data transfer in Vercel dashboard
- Verwacht significante daling na enkele dagen

## ⚠️ Belangrijk

1. **Backups**: Originals worden opgeslagen in `public/backup/`
2. **Test eerst**: Review gecomprimeerde bestanden voordat je originals vervangt
3. **Kwaliteit**: Als compressie te agressief is, pas CRF aan (lager = betere kwaliteit)
4. **WebP Support**: Moderne browsers ondersteunen WebP, oudere browsers vallen terug op PNG/JPG

## 🛠️ Geavanceerde Optimalisatie

### Video Quality Aanpassen:
Edit `scripts/optimize-videos.ps1`:
- **CRF 23-25**: Hoge kwaliteit (grotere bestanden)
- **CRF 28**: Goede balans (aanbevolen)
- **CRF 30-32**: Meer compressie (kleinere bestanden)

### Image Quality Aanpassen:
Edit `scripts/convert-to-webp.ps1`:
- **Quality 90-95**: Hoge kwaliteit
- **Quality 85**: Goede balans (aanbevolen)
- **Quality 75-80**: Meer compressie

### Responsive Images:
Voor nog betere optimalisatie, gebruik `srcset`:
```html
<img srcset="image-small.webp 480w, image-medium.webp 768w, image-large.webp 1200w"
     sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
     src="image-large.webp" alt="...">
```

## 📞 Hulp Nodig?

- FFmpeg installatie: https://ffmpeg.org/download.html
- ImageMagick installatie: https://imagemagick.org/script/download.php
- WebP tools: https://developers.google.com/speed/webp/download
- Online tools: https://squoosh.app/ (geen installatie nodig)
