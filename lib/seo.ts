import type { Metadata } from 'next'

export const SITE_URL = 'https://corridor.gent'

export const DEFAULT_TITLE = 'Corridor - Urban Hub onder het Viaduct van Gentbrugge'

export const DEFAULT_DESCRIPTION =
  "Corri d'Or is de urban spot in Gentbrugge waar de stad écht tot leven komt. Onder het E17-viaduct vind je een plek om te bewegen, te chillen en samen te komen."

export function publicMetadata(input: {
  title: string
  description: string
  path: string
}): Metadata {
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.path,
      locale: 'nl_BE',
      type: 'website',
      siteName: 'Corridor',
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
    },
  }
}

export const privateRobots: Metadata = {
  robots: { index: false, follow: false },
}

/** Public facts already shown on the homepage (Kom Langs). */
export function placeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: 'Corridor',
    alternateName: "Corri d'Or",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    image: `${SITE_URL}/FlyerVoorkant.webp`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Einde Driebeekstraat',
      postalCode: '9050',
      addressLocality: 'Gentbrugge',
      addressCountry: 'BE',
    },
    sameAs: [
      'https://www.facebook.com/corridor.gentbrugge',
      'https://www.instagram.com/corridor9050/',
      'https://www.tiktok.com/@corridor9050',
    ],
  }
}
