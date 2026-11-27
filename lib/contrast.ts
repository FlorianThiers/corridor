/** Relatieve luminantie en contrastverhouding (WCAG 2.x). */

export function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '')
  const channels = [0, 2, 4].map((index) => {
    const channel = parseInt(value.slice(index, index + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

/** Dekking van een effen kleur over een andere, als #rrggbb. */
export function compositeHex(overlay: string, base: string, alpha: number): string {
  const parse = (hex: string) =>
    [0, 2, 4].map((index) => parseInt(hex.replace('#', '').slice(index, index + 2), 16))
  const over = parse(overlay)
  const under = parse(base)
  const mixed = over.map((channel, index) =>
    Math.round(channel * alpha + under[index] * (1 - alpha))
  )
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

/** AA voor gewone tekst is 4.5:1, voor grote tekst en UI-onderdelen 3:1. */
export const WCAG_AA_TEXT = 4.5
export const WCAG_AA_LARGE = 3
