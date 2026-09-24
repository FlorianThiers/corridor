# Zones upgrade (Matty × Florian — 2026-09-24)

## Branch

`feat/zones-upgrade`

## Before deploy

1. **Supabase SQL Editor:** run `supabase/migrations/20260924_zones_upgrade.sql`
2. **Storage:** create public bucket `zone-photos` (Dashboard → Storage)
3. Optional storage policies: authenticated upload to `zone/*/pending/**` and `history/**`; public read

## What shipped

| Fase | Status |
|------|--------|
| A — zones 7–12 remap + detail `/zones/[n]` + admin cover/gallery | code ready |
| B — QR print | **Matty** (URLs: `https://corridor.gent/zones` · `…/zones/7` …) |
| C — UGC upload + moderation (account + email verified) | in Admin Zones pending queue |
| D — geschiedenis CMS + `/beheer/geschiedenis` | done; agenda = existing `/beheer/evenementen` |

## Remap

Live had 7 Hills / 8 Logistiek / 9 Corri Art → target 7 Parkour, 8 Hilles, 9 RC17, 10 Logistiek, 11 Corri Arts, 12 Lege zone.
