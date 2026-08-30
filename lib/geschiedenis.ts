export interface HistoryPhoto {
  src: string
  alt: string
  caption?: string
}

export interface HistoryMilestone {
  year: string
  title: string
  description: string
}

/**
 * Captions gekoppeld aan de werkelijke inhoud van elk bestand (niet aan de bestandsnaam).
 * Volgorde = chronologisch verhaal.
 */
export const historyPhotos: HistoryPhoto[] = [
  {
    src: '/geschiedenis/13-meubilair-onder-brug.png',
    alt: 'De naam Corridor geschilderd op de wand onder het viaduct',
    caption: 'De naam op de wand',
  },
  {
    src: '/geschiedenis/10-graffiti-noodles-tovenaar.png',
    alt: 'Heftruck plaatst betonblok met #CORRIDOR 9050 graffiti',
    caption: '#CORRIDOR 9050',
  },
  {
    src: '/geschiedenis/15-mulch-aanleg.png',
    alt: 'Betonblokken worden geschikt en gestapeld onder het viaduct',
    caption: 'Betonblokken schikken',
  },
  {
    src: '/geschiedenis/01-corridor-naam-schildering.png',
    alt: 'Vrijwilliger maakt betonblokken schoon onder de brug',
    caption: 'Samen proper maken',
  },
  {
    src: '/geschiedenis/12-graffiti-opkijken.png',
    alt: 'Modulair houten meubilair onder het viaduct',
    caption: 'Zelf meubilair bouwen',
  },
  {
    src: '/geschiedenis/14-corridor-bord-meubilair.png',
    alt: 'Corridor-bord met meubilair en oproep voor vrijwilligers',
    caption: 'Corridor zoekt vrijwilligers',
  },
  {
    src: '/geschiedenis/05-graffiti-pilaar-kleur.png',
    alt: "Buurtkaart met het Corrid'or-masterplan ingetekend",
    caption: 'Masterplan op de buurtkaart',
  },
  {
    src: '/geschiedenis/06-graffiti-clown-sofie-d.png',
    alt: 'Muurschildering van een clown met hond door Sofie D.',
    caption: 'Sofie D.',
  },
  {
    src: '/geschiedenis/07-graffiti-schedel-nacht.png',
    alt: 'Grote schedel-graffiti bij nacht met ladder',
    caption: 'Nachtwerk op de pilaar',
  },
  {
    src: '/geschiedenis/08-graffiti-monster-gouden-uur.png',
    alt: 'Muurschildering in avondlicht onder het viaduct',
    caption: 'Nieuwe kleur op beton',
  },
  {
    src: '/geschiedenis/02-corridor-9050-heftruck.png',
    alt: 'Portretmuurschildering met vogel op paarse achtergrond',
    caption: 'Muurschildering met vogel',
  },
  {
    src: '/geschiedenis/03-betonblokken-stapelen.png',
    alt: 'NOODLES graffiti met tovenaar en ketel',
    caption: 'NOODLES',
  },
  {
    src: '/geschiedenis/04-betonblokken-schoonmaken.png',
    alt: 'Portret van een oudere man door Frakkie',
    caption: 'Frakkie',
  },
  {
    src: '/geschiedenis/11-graffiti-frakkie.png',
    alt: 'Figuur die omhoog kijkt, geschilderd op een pilaar',
    caption: 'Omhoog kijken',
  },
  {
    src: '/geschiedenis/09-graffiti-vrouw-vogel.png',
    alt: 'Vroege skateplek onder het viaduct met graffiti en fiets',
    caption: 'Eerste tags en obstakels',
  },
  {
    src: '/geschiedenis/18-vuurschaal-logbanken.png',
    alt: 'Vuurschaal met logbanken rond een graffiti-pilaar onder het viaduct',
    caption: 'De vuurschaal (later verboden)',
  },
  {
    src: '/geschiedenis/16-daf-bus.png',
    alt: 'Houtsnippers en mulch tussen betonblokken onder de brug',
    caption: 'Houtsnippers tussen de blokken',
  },
  {
    src: '/geschiedenis/17-evolutie.png',
    alt: 'Groene DAF-bus onder het viaduct',
    caption: 'De legendarische bus',
  },
]

export const historyMilestones: HistoryMilestone[] = [
  {
    year: '2020',
    title: 'Het begint onder de brug',
    description:
      'Buurtbewoners en vrijwilligers zien potentieel in het braakliggende terrein onder het E17-viaduct. De naam Corridor verschijnt op de wand, betonblokken worden verplaatst en de eerste graffiti kleurt de pilaren.',
  },
  {
    year: '2021–2022',
    title: 'Zelf bouwen, zelf kleuren',
    description:
      'Met eigen handen groeit de plek: meubilair, logbanken rond een vuurschaal, kunstwerken, een groene DAF-bus en tientallen muurschilderingen. Elke zaterdag staat iemand op de blokken of pakt de verfkwast.',
  },
  {
    year: '2023',
    title: 'Burgerbudget en erkenning',
    description:
      'Het project bouwt voort op het werk van een bewonersgroep via het burgerbudget. Corridor wordt een plek waar organisaties, buren en jongeren elkaar vinden.',
  },
  {
    year: '2024–2025',
    title: 'Van DIY naar urban hub',
    description:
      "Corri d'Or opent als urban spot: sport, events, drankje en buurtactiviteiten. De folieke-vuurschaal werd snel verboden door de stad, maar de sfeer bleef.",
  },
  {
    year: '2025',
    title: 'Matexi Award',
    description:
      'Corridor wint de Matexi Award 2025 en later ook de publieksprijs. Reden genoeg om te vieren — en om het verhaal verder te schrijven.',
  },
]
