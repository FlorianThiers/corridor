import type { Partner } from '@/types'

export type SitePartnerCategory =
  | 'sport'
  | 'netwerk'
  | 'onderwijs'
  | 'financier'

export interface SitePartner {
  id: string
  name: string
  description: string
  websiteUrl?: string
  category: SitePartnerCategory
  /** Match keys for logos uploaded via beheer (normalized). */
  logoKeys?: string[]
}

export const SITE_PARTNER_SECTIONS: {
  category: SitePartnerCategory
  title: string
  intro?: string
}[] = [
  {
    category: 'sport',
    title: 'Sport & urban clubs',
    intro:
      'Verenigingen en collectieven die activiteiten organiseren of ondersteunen op Corridor.',
  },
  {
    category: 'netwerk',
    title: 'Netwerk & buurt',
    intro: 'Buurtpartners en organisaties die mee bouwen aan de site en het ecosysteem.',
  },
  {
    category: 'onderwijs',
    title: 'Onderwijs & leerecosysteem',
    intro: 'Ondersteuning rond leren, onderzoek en begeleiding van het WSE-traject.',
  },
  {
    category: 'financier',
    title: 'Overheden & financiers',
    intro: 'Publieke en private steun die Corridor mogelijk maken.',
  },
]

/** Canonieke partnerlijst — logos komen uit Supabase beheer waar beschikbaar. */
export const SITE_PARTNERS: SitePartner[] = [
  // Sport & urban
  {
    id: 'sportaround',
    name: 'Sportaround',
    description: 'Coördinatie, animatie en dagelijkse werking op Corridor.',
    websiteUrl: 'https://www.sportaround.be',
    category: 'sport',
    logoKeys: ['sportaround', 'sport around'],
  },
  {
    id: 'ghent-basketball',
    name: 'Ghent Basketball',
    description: 'Basketbal en sociaal-sportief werk (o.a. Viadunk).',
    websiteUrl: 'https://www.ghentbasketball.org',
    category: 'sport',
    logoKeys: ['ghent basketball', 'basket', 'basketbal'],
  },
  {
    id: 'hall-of-skate',
    name: 'Hall of Skate',
    description: 'Skate-community en urban skate-initiatieven in Gent.',
    category: 'sport',
    logoKeys: ['hall of skate', 'hallofskate'],
  },
  {
    id: 'skateboard-academy',
    name: 'Skateboard Academy',
    description: 'Skatelessen, initiaties en begeleiding voor jongeren.',
    category: 'sport',
    logoKeys: ['skateboard academy'],
  },
  {
    id: 'flow-de-gand',
    name: 'Flow de Gand',
    description: 'Parkour en freerunning — training en community in Gent.',
    category: 'sport',
    logoKeys: ['flow de gand', 'flow de gent'],
  },
  {
    id: 'fros',
    name: 'FROS',
    description: 'Freerunning en urban movement op en rond Corridor.',
    category: 'sport',
    logoKeys: ['fros'],
  },
  {
    id: 'rc17',
    name: 'RC17',
    description: 'Urban sports en beweging — partner in het Corridor-netwerk.',
    category: 'sport',
    logoKeys: ['rc17'],
  },
  {
    id: 'together-we-stand',
    name: 'Together We Stand',
    description: 'Urban community, events en samenwerking met jongeren.',
    category: 'sport',
    logoKeys: ['together we stand'],
  },
  {
    id: 'corrihop',
    name: 'Corrihop',
    description: 'Dans en hop-initiatieven onder het viaduct.',
    category: 'sport',
    logoKeys: ['corrihop', 'dans'],
  },
  // Netwerk
  {
    id: 'lejo',
    name: 'Lejo vzw',
    description: 'Jeugdwerk en begeleiding in het leerecosysteem.',
    category: 'netwerk',
    logoKeys: ['lejo'],
  },
  {
    id: 'asgaard',
    name: 'Asgaard',
    description: 'Buurtpartner in de ontwikkeling rond Corridor.',
    category: 'netwerk',
    logoKeys: ['asgaard'],
  },
  {
    id: 'vierde-zaal',
    name: 'De Vierde Zaal',
    description: 'Buurtpartner en verbinding met de wijk.',
    category: 'netwerk',
    logoKeys: ['vierde zaal', 'de vierde zaal'],
  },
  {
    id: 'volkstuinen',
    name: 'Buurtvolkstuinen',
    description: 'Volkstuinen en buurtbewoners rond het viaduct.',
    category: 'netwerk',
    logoKeys: ['volkstuinen', 'volkstuin'],
  },
  {
    id: 'wijkbudget',
    name: 'Wijkbudget-indieners',
    description: 'Bewoners die Corridor mee mogelijk maakten via het Gentse wijkbudget.',
    category: 'netwerk',
    logoKeys: ['wijkbudget'],
  },
  // Onderwijs
  {
    id: 'artevelde',
    name: 'Arteveldehogeschool',
    description: 'Onderzoek, studenten en leerecosysteem rond urban sports.',
    websiteUrl: 'https://www.arteveldehogeschool.be',
    category: 'onderwijs',
    logoKeys: ['artevelde', 'arteveldehogeschool'],
  },
  {
    id: 'matty-zighem',
    name: 'Matty Zighem',
    description: 'Begeleiding en kennis rond het WSE-leerecosysteem.',
    category: 'onderwijs',
    logoKeys: ['matty zighem', 'zighem'],
  },
  // Financiers & overheden
  {
    id: 'eu-wse',
    name: 'Europese Unie (WSE)',
    description: 'Work-based Skills Ecosystem — Europees programma voor leerecosystemen.',
    websiteUrl: 'https://ec.europa.eu/social/main.jsp?catId=1501',
    category: 'financier',
    logoKeys: ['europa', 'european union', 'wse', 'eu'],
  },
  {
    id: 'vlaanderen',
    name: 'Vlaanderen',
    description: 'Steun via o.a. Streekfonds Oost-Vlaanderen.',
    websiteUrl: 'https://www.vlaanderen.be',
    category: 'financier',
    logoKeys: ['vlaanderen', 'streekfonds', 'oost-vlaanderen'],
  },
  {
    id: 'stad-gent',
    name: 'Stad Gent',
    description: 'Fonds Tijdelijke Invullingen en stedelijke samenwerking.',
    websiteUrl: 'https://stad.gent',
    category: 'financier',
    logoKeys: ['stad gent', 'gent'],
  },
  {
    id: 'warmste-week',
    name: 'Warmste Week',
    description: 'Solidariteitsactie en steun voor sociale projecten.',
    websiteUrl: 'https://www.dewarmsteweek.be',
    category: 'financier',
    logoKeys: ['warmste week'],
  },
]

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isTestPartnerName(name: string): boolean {
  const n = normalizeKey(name)
  return n.includes('test partner') || n === 'test'
}

export function buildPartnerLogoMap(dbPartners: Partner[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const partner of dbPartners) {
    if (!partner.logo_url || isTestPartnerName(partner.name)) continue
    map.set(normalizeKey(partner.name), partner.logo_url)
    for (const sitePartner of SITE_PARTNERS) {
      if (sitePartner.logoKeys?.some((key) => normalizeKey(key) === normalizeKey(partner.name))) {
        map.set(sitePartner.id, partner.logo_url)
      }
    }
  }
  return map
}

export function resolveSitePartnerLogo(
  sitePartner: SitePartner,
  logoMap: Map<string, string>
): string | undefined {
  const direct = logoMap.get(sitePartner.id)
  if (direct) return direct
  for (const key of sitePartner.logoKeys ?? []) {
    const url = logoMap.get(normalizeKey(key))
    if (url) return url
  }
  return undefined
}

export function getSitePartnersByCategory(category: SitePartnerCategory): SitePartner[] {
  return SITE_PARTNERS.filter((p) => p.category === category)
}
