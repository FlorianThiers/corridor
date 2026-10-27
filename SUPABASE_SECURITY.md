# Supabase Security - Anon Key is Veilig

## ⚠️ Vercel Waarschuwing Over NEXT_PUBLIC_SUPABASE_ANON_KEY

Vercel toont een waarschuwing wanneer je `NEXT_PUBLIC_SUPABASE_ANON_KEY` toevoegt. **Dit is een valse waarschuwing** - je kunt deze veilig negeren.

## ✅ Waarom is de Anon Key Veilig?

### 1. Supabase Anon Key is Publiek by Design

De Supabase **anon key** is specifiek ontworpen om:
- ✅ Publiek te zijn
- ✅ In de browser te worden gebruikt
- ✅ In client-side code te worden gebruikt
- ✅ In environment variables met `NEXT_PUBLIC_` prefix te staan

### 2. Row Level Security (RLS) Beschermt Je Data

Supabase gebruikt **Row Level Security (RLS) policies** om toegang te beheren:
- De anon key geeft alleen toegang tot data die expliciet is toegestaan via RLS policies
- Zonder juiste RLS policies kan de anon key **geen data** lezen of schrijven
- Je database is beschermd door RLS, niet door de key zelf

### 3. Service Role Key is Geheim

**BELANGRIJK**: Er is een verschil tussen:
- **Anon Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) → ✅ Publiek, veilig voor browser
- **Service Role Key** → ❌ GEHEIM, NOOIT in browser gebruiken!

De **Service Role Key**:
- ❌ Moet NOOIT in `NEXT_PUBLIC_` variables staan
- ❌ Moet NOOIT in client-side code worden gebruikt
- ❌ Moet alleen server-side worden gebruikt
- ❌ Bypassed RLS policies (heeft volledige toegang)

## Vercel environment variables — actie voor Florian

De admin client (`lib/supabase/admin.ts`) leest **alleen** de server-only variabele `SUPABASE_SERVICE_ROLE_KEY`. Ontbreekt die, dan gooit `createAdminClient()` een error. Er is geen fallback meer.

`NEXT_PUBLIC_`-variabelen worden in de browserbundel gezet. Een service role key met die prefix is een gelekt geheim: ze bypassed RLS.

### Zetten (verplicht)

| Variabele | Environments | Opmerking |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development | Server-only. Waarde = Supabase **service_role** key (Settings → API). Geen `NEXT_PUBLIC_`-prefix. |

Zonder deze variabele faalt agenda-import (`POST /api/v1/agenda/import`) luid. De media-feed logt een waarschuwing en valt terug op de anon client (RLS), niet op een publieke service role key.

### Verwijderen

| Variabele | Environments |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development — overal waar ze nog staat |

Verwijder de variabele volledig. Niet hernoemen naar een andere `NEXT_PUBLIC_`-naam. Na het verwijderen een nieuwe deployment laten bouwen, zodat de oude waarde uit de clientbundel verdwijnt. Deze PR zelf niet mergen of deployen tot de server-only key gezet is.

### Laten staan (publiek, geen geheim)

| Variabele | Opmerking |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Publieke project-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publieke anon key; toegang loopt via RLS |
| `NEXT_PUBLIC_SITE_URL` | Optioneel, publieke site-URL voor auth-redirects |

### Andere server-only variabelen (geen `NEXT_PUBLIC_`)

Deze zijn geen Supabase-service-role, maar ook geen browsergeheimen. Niet naar `NEXT_PUBLIC_` verplaatsen.

| Variabele | Opmerking |
| --- | --- |
| `CORRIDOR_AGENDA_API_KEY` | Bearer-token voor de agenda-API |
| `CORRIDOR_MEDIA_API_KEY` | Optioneel; aparte token voor `GET /api/v1/media` |
| `CORRIDOR_SITE_URL` | Optioneel; absolute URL in de media-feed |

## 🔒 Best Practices

### ✅ Veilig

```env
# Publiek - anon key is publiek
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (anon key)

# Server-only - service role, nooit NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role key)
```

### ❌ Onveilig (verwijderen als die nog op Vercel staat)

```env
# ONVEILIG - service role key met NEXT_PUBLIC_ lekt naar de browser
# NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role key)
```

## 📋 Wat Te Doen Met De Waarschuwing?

### Optie 1: Negeer de Waarschuwing (Aanbevolen)
- De waarschuwing is een algemene Vercel waarschuwing
- Ze kunnen niet weten dat Supabase anon keys veilig zijn
- Je kunt de waarschuwing gewoon negeren

### Optie 2: Verifieer in Supabase Dashboard
1. Ga naar Supabase Dashboard
2. Settings > API
3. Je ziet daar:
   - **anon public** → Dit is de publieke key (veilig voor browser)
   - **service_role** → Dit is de geheime key (NOOIT in browser)

## 🛡️ Hoe Wordt Je Data Beschermd?

### 1. Row Level Security (RLS)
RLS policies bepalen wie toegang heeft tot welke data:

```sql
-- Voorbeeld: Alleen ingelogde users kunnen hun eigen data zien
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

### 2. Database Policies
- Policies bepalen wat de anon key kan doen
- Zonder policy = geen toegang
- Met policy = alleen toegang zoals gedefinieerd

### 3. Auth System
- Supabase Auth beheert gebruikerssessies
- Cookies worden gebruikt voor authenticatie
- Anon key + auth token = geautoriseerde toegang

## ✅ Conclusie

**De waarschuwing is veilig te negeren!**

- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` is veilig om publiek te maken
- ✅ Dit is de bedoelde manier om Supabase te gebruiken
- ✅ Je data is beschermd door RLS policies
- ✅ De anon key kan alleen doen wat RLS policies toestaan

## 🔍 Verificatie

Om te verifiëren dat je de juiste key gebruikt:

1. **Supabase Dashboard** > **Settings** > **API**
2. Check dat je de **anon public** key gebruikt (niet service_role)
3. De anon key begint meestal met `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Service role key heeft een andere structuur

## 📚 Meer Informatie

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Anon Key Explanation](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
