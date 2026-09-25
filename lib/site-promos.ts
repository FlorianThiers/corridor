export interface SitePromo {
  id: string
  imageSrc: string
  imageAlt: string
  title: string
  tagline: string
  dates: string
  location?: string
  ctaHref: string
  ctaLabel: string
  signupHref?: string
  signupLabel?: string
  secondarySignupHref?: string
  secondarySignupLabel?: string
  activeUntil: string
  imageBg: string
  borderClass: string
  sectionClass: string
  badgeLabel: string
  floatingPosition: 'left' | 'right'
  anchorId: string
}

export const SUMMER_PROMO: SitePromo = {
  id: 'summer',
  imageSrc: '/zomervakantie-corridor-2026.webp',
  imageAlt: "Affiche zomervakantie Corri D'Or — wekelijks sportaanbod",
  title: 'Zomervakantie @ Corrid\'Or',
  tagline: 'Elke week sport en animatie — de plek blijft ook buiten het aanbod open om te sporten.',
  dates: '28 juni – 30 augustus 2026',
  location: 'Driebeekstraat, Gentbrugge',
  ctaHref: '/activiteiten',
  ctaLabel: 'Bekijk het zomerprogramma',
  activeUntil: '2026-08-31T00:00:00+02:00',
  imageBg: '#7ec8c8',
  borderClass: 'border-teal-200/60',
  sectionClass: 'section-gradient-5',
  badgeLabel: 'Deze zomer',
  floatingPosition: 'left',
  anchorId: 'zomervakantie',
}

export const FEST_PROMO: SitePromo = {
  id: 'fest',
  imageSrc: '/corri-dor-fest-2026.webp',
  imageAlt: "Affiche Corri D'Or Fest — 25 en 26 september in Gentbrugge",
  title: "Corri D'Or Fest",
  tagline: 'Een festival voor iedereen onder en rond het viaduct',
  dates: '25 & 26 september 2026',
  location: 'Driebeekstraat, Gentbrugge',
  ctaHref: '/evenementen#fest-programma',
  ctaLabel: 'Bekijk het programma',
  signupHref: 'https://forms.gle/VFoer92h8heLphWA8',
  signupLabel: 'Schrijf je in',
  secondarySignupHref: 'https://shop.stamhoofd.be/track-tracks-x-corri-d-or',
  secondarySignupLabel: 'Silent disco run — tickets (€12)',
  activeUntil: '2026-09-27T00:00:00+02:00',
  imageBg: '#f5e642',
  borderClass: 'border-yellow-200/60',
  sectionClass: 'section-gradient-3',
  badgeLabel: 'Save the date',
  floatingPosition: 'right',
  anchorId: 'corri-dor-fest',
}

export const TRACK_TRACKS_TICKET_URL =
  'https://shop.stamhoofd.be/track-tracks-x-corri-d-or'

/** Homepage-volgorde: eerst wat het dichtst bij ligt in de tijd */
export const HOMEPAGE_PROMOS = [SUMMER_PROMO, FEST_PROMO] as const

export function isPromoActive(promo: SitePromo, now = new Date()): boolean {
  return now.getTime() < new Date(promo.activeUntil).getTime()
}

export function getActivePromos(now = new Date()): SitePromo[] {
  return HOMEPAGE_PROMOS.filter((promo) => isPromoActive(promo, now))
}

export function isFestEvent(title: string): boolean {
  return title.startsWith(FEST_PROMO.title) || title.startsWith("Corri D'Or Fest")
}

export function posterHref(promo: SitePromo): string {
  return promo.signupHref ?? promo.ctaHref
}
