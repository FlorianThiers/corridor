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

## 🔒 Best Practices

### ✅ Veilig (Wat We Nu Doen)

```env
# ✅ Veilig - Anon key is publiek
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (anon key)
```

### ❌ Onveilig (Nooit Doen)

```env
# ❌ ONVEILIG - Service role key is geheim
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role key, nooit NEXT_PUBLIC_)
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
