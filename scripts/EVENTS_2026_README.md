# Corrid'Or Evenementen 2026 - SQL Script

## Overzicht

Dit script voegt alle geplande evenementen voor Corrid'Or in 2026 toe aan de Supabase database.

## Verschil tussen Agenda en Evenementen

**Belangrijk:** Beide pagina's gebruiken dezelfde `evenementen` tabel in Supabase. Het verschil zit alleen in de weergave:

- **Agenda** (`/agenda`): Toont evenementen in een kalenderweergave (maandoverzicht met klikbare dagen)
- **Evenementen** (`/evenementen`): Toont evenementen als een lijst van kaarten (EventCard componenten)

Beide pagina's halen hun data uit dezelfde `getEvenementen()` functie, dus alle evenementen die je toevoegt verschijnen automatisch op beide pagina's.

## Database Structuur

De `evenementen` tabel heeft de volgende velden:

- `id` (UUID, automatisch gegenereerd)
- `title` (text, verplicht) - Titel van het evenement
- `description` (text, optioneel) - Beschrijving van het evenement
- `start_datetime` (timestamptz, verplicht) - Startdatum en tijd
- `end_datetime` (timestamptz, optioneel) - Einddatum en tijd
- `zone_id` (UUID, optioneel) - Link naar een zone
- `for_girls` (boolean, default false) - Of het een Corrigirls evenement is
- `created_by` (UUID, optioneel) - Wie het evenement heeft aangemaakt
- `created_at` (timestamptz) - Aanmaakdatum
- `updated_at` (timestamptz) - Laatste update

## Hoe het Script te Gebruiken

### Optie 1: Via Supabase Dashboard

1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in het linker menu
3. Open het bestand `scripts/insert-corridor-events-2026.sql`
4. Kopieer de volledige inhoud
5. Plak het in de SQL Editor
6. Klik op "Run" om het script uit te voeren

### Optie 2: Via Supabase CLI

```bash
supabase db execute -f scripts/insert-corridor-events-2026.sql
```

### Optie 3: Via psql (PostgreSQL client)

```bash
psql -h [your-supabase-host] -U postgres -d postgres -f scripts/insert-corridor-events-2026.sql
```

## Aanpassingen

### Zone ID's

Als je evenementen aan specifieke zones wilt koppelen, moet je de `zone_id` toevoegen aan de INSERT statements. Je kunt de zone ID's vinden door deze query uit te voeren:

```sql
SELECT id, zone_number, name FROM zones;
```

Vervang dan `NULL` in het script door de juiste UUID, bijvoorbeeld:

```sql
INSERT INTO evenementen (title, description, start_datetime, end_datetime, zone_id, ...)
VALUES (
  'Social run met Bashir',
  'Start aan atletiekpiste maar stop aan Corrid''Or',
  '2026-01-03 10:00:00+00',
  '2026-01-03 12:00:00+00',
  '123e4567-e89b-12d3-a456-426614174000', -- Zone UUID hier
  ...
);
```

### Created By

Als je wilt bijhouden wie de evenementen heeft aangemaakt, kun je een `created_by` UUID toevoegen. Je kunt gebruikers vinden met:

```sql
SELECT id, email, full_name FROM users;
```

## Verificatie

Na het uitvoeren van het script, kun je controleren of alle evenementen correct zijn toegevoegd:

```sql
-- Totaal aantal evenementen in 2026
SELECT COUNT(*) as total_events 
FROM evenementen 
WHERE start_datetime >= '2026-01-01' AND start_datetime < '2027-01-01';

-- Evenementen per maand
SELECT 
  DATE_TRUNC('month', start_datetime) as month,
  COUNT(*) as events_count
FROM evenementen
WHERE start_datetime >= '2026-01-01' AND start_datetime < '2027-01-01'
GROUP BY DATE_TRUNC('month', start_datetime)
ORDER BY month;

-- Alle evenementen in chronologische volgorde
SELECT 
  title,
  start_datetime,
  end_datetime,
  description
FROM evenementen
WHERE start_datetime >= '2026-01-01' AND start_datetime < '2027-01-01'
ORDER BY start_datetime;
```

## Opmerkingen over de Data

### Tijden

Voor evenementen zonder specifieke tijd zijn standaard tijden gebruikt:
- Ochtend evenementen: 10:00 - 12:00
- Middag evenementen: 14:00 - 18:00
- Avond evenementen: 18:00 - 23:00

Je kunt deze tijden later aanpassen via het admin panel of door de evenementen te bewerken.

### Multi-day Evenementen

Voor evenementen die meerdere dagen duren (zoals "Beton up fest" van 25-27 september), is `end_datetime` ingesteld op de laatste dag om 23:00.

### Zomer Evenementen

De zomerperiode (iedere week van de grote vakantie) is opgesplitst in 8 wekelijkse evenementen. Elke week heeft een eigen evenement van woensdag tot zaterdag, 14:00-17:00.

### Corrigirls Evenementen

Het Iftar evenement is gemarkeerd als `for_girls = true` omdat het specifiek vermeldt "met jongeren en meisjeswerking".

## Eventuele Aanpassingen

Als je later evenementen wilt toevoegen, bewerken of verwijderen, kun je:

1. **Via Admin Panel**: Ga naar `/beheer/evenementen` (als je admin rechten hebt)
2. **Via SQL**: Gebruik UPDATE of DELETE queries
3. **Via Code**: Gebruik de functies in `lib/database.ts` (`createEvenement`, `updateEvenement`, `deleteEvenement`)

## Troubleshooting

### Fout: "permission denied"
- Controleer of je RLS (Row Level Security) policies correct zijn ingesteld
- Zorg dat je ingelogd bent als admin in Supabase

### Fout: "column does not exist"
- Controleer of de `evenementen` tabel bestaat en de juiste kolommen heeft
- Voer `\d evenementen` uit in psql om de tabel structuur te zien

### Evenementen verschijnen niet op de website
- Controleer of `start_datetime` in de toekomst ligt (of pas de filter aan)
- Controleer of de revalidate tijd niet te lang is ingesteld
- Hard refresh de pagina (Ctrl+F5 of Cmd+Shift+R)
