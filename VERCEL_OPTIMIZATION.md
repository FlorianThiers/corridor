# Vercel Optimization Guide

## Optimalisaties voor Vercel Usage

Deze applicatie is geoptimaliseerd om het aantal requests naar Supabase te minimaliseren en de performance te verbeteren.

### 1. Server-Side Caching (ISR - Incremental Static Regeneration)

Alle pagina's gebruiken `revalidate = 60` om data te cachen voor 60 seconden. Dit betekent:
- **Eerste request**: Data wordt gefetcht van Supabase
- **Volgende requests (binnen 60s)**: Data wordt geserveerd vanuit cache
- **Na 60 seconden**: Cache wordt automatisch gerevalideerd

**Gevolg**: In plaats van elke page load een nieuwe request, worden requests gedeeld over 60 seconden.

### 2. Parallel Data Fetching

Op de homepage worden alle data queries parallel uitgevoerd:
```typescript
const [evenementenData, zonesData, corristoriesData] = await Promise.all([
  getEvenementen(supabase),
  getZones(supabase),
  getCorristories(supabase)
])
```

**Gevolg**: 3 requests worden tegelijk uitgevoerd in plaats van sequentieel, wat de totale laadtijd reduceert.

### 3. Supabase Client Singleton Pattern

De Supabase client gebruikt een singleton pattern om te voorkomen dat er meerdere client instances worden gemaakt:
```typescript
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (browserClient) {
    return browserClient
  }
  // ... create new client
}
```

**Gevolg**: Minder overhead, betere connection pooling.

### 4. useAuth Hook Optimalisatie

De `useAuth` hook gebruikt `useMemo` om de Supabase client te memoizen en voorkomt onnodige re-renders:
```typescript
const supabase = useMemo(() => createClient(), [])
```

**Gevolg**: Client wordt niet opnieuw aangemaakt bij elke render.

### 5. Admin Components

Admin components gebruiken `useEffect` met een lege dependency array om data slechts één keer te laden bij mount:
```typescript
useEffect(() => {
  loadData()
}, []) // Only run once on mount
```

**Gevolg**: Data wordt niet opnieuw geladen bij elke re-render.

## Request Schatting

### Zonder Optimalisatie:
- **Homepage**: 3 requests per page load
- **Andere pagina's**: 1 request per page load
- **Admin pagina's**: 2-3 requests per page load
- **Totaal bij 100 page loads**: ~200-300 requests

### Met Optimalisatie:
- **Homepage**: 3 requests per 60 seconden (gedeeld over alle users)
- **Andere pagina's**: 1 request per 60 seconden (gedeeld over alle users)
- **Admin pagina's**: 2-3 requests per page load (real-time data nodig)
- **Totaal bij 100 page loads**: ~50-100 requests (afhankelijk van timing)

**Besparing**: ~50-70% minder requests!

## Monitoring

### Vercel Analytics
Gebruik Vercel Analytics om:
- Request patterns te monitoren
- Response times te tracken
- Error rates te bekijken

### Supabase Dashboard
Monitor in Supabase Dashboard:
- API requests per dag
- Database queries
- Bandwidth usage

## Best Practices

1. **Gebruik ISR voor statische content**: Pagina's met data die niet constant verandert
2. **Gebruik `force-dynamic` voor admin pagina's**: Real-time data nodig
3. **Parallel fetching**: Gebruik `Promise.all()` voor meerdere queries
4. **Client singleton**: Hergebruik Supabase clients waar mogelijk
5. **Monitor usage**: Houd Supabase usage in de gaten via dashboard

## Environment Variables

Zorg dat deze environment variables zijn ingesteld in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Revalidatie Tijd Aanpassen

Als je de cache tijd wilt aanpassen, wijzig `revalidate` in de page files:
```typescript
export const revalidate = 60 // seconden
```

- **Kortere tijd (30s)**: Meer up-to-date data, meer requests
- **Langere tijd (300s)**: Minder requests, mogelijk verouderde data
