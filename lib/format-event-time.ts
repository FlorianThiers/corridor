/** Site-facing datetimes are always Europe/Brussels (Corrid'Or / Gent). */
export const SITE_TIME_ZONE = 'Europe/Brussels'

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('nl-NL', { timeZone: SITE_TIME_ZONE })
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: SITE_TIME_ZONE,
  })
}
