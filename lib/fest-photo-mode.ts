/** During Corri d'Or Fest weekend: UGC photos go live without admin approval (DB trigger). */
export const FEST_PHOTO_AUTO_APPROVE_UNTIL = '2026-09-27T00:00:00+02:00'

/** UI hint: recap uploads on /corridorfest stay open through this date. */
export const FEST_PHOTO_UPLOAD_RECAP_UNTIL = '2026-10-31T23:59:59+01:00'

export function isFestPhotoAutoApprove(now = new Date()): boolean {
  return now.getTime() < new Date(FEST_PHOTO_AUTO_APPROVE_UNTIL).getTime()
}

export function isFestPhotoRecapOpen(now = new Date()): boolean {
  return now.getTime() < new Date(FEST_PHOTO_UPLOAD_RECAP_UNTIL).getTime()
}
