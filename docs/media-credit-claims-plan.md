# Credits voor Urban Culture

Claims horen bij Urban Culture, niet bij Corridor. Corridor levert de foto's en de zones, en laat UC daarna alleen de credit overschrijven.

## Read-only

Zelfde Bearer-key (`CORRIDOR_MEDIA_API_KEY`, anders `CORRIDOR_AGENDA_API_KEY`):

- `GET /api/v1/media` — goedgekeurde foto's. Filter op zone met `?zone=<slug>`.
- `GET /api/v1/zones` — één spot per zone.

## Credit schrijven

`PATCH /api/v1/media/:id` met `CORRIDOR_MEDIA_WRITE_API_KEY` (een andere sleutel dan de read-only keys).

Body, en niets anders: `{ "credit": "Naam" }` of `{ "credit": null }` om de standaard terug te zetten.

Standaard tot UC overschrijft: oudere Corristories-foto's `Corridor`, anders de naam van de uploader. Een expliciete credit op de foto (bijvoorbeeld een graffitisignatuur) blijft staan tot UC die overschrijft.

De tabel `media_credit_overrides` staat in een migratiebestand en wordt niet door de app uitgevoerd.
