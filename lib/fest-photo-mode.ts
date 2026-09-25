/** During Corri d'Or Fest: UGC photos go live without admin approval. */
export const FEST_PHOTO_AUTO_APPROVE_UNTIL = '2026-09-27T00:00:00+02:00'

export function isFestPhotoAutoApprove(now = new Date()): boolean {
  return now.getTime() < new Date(FEST_PHOTO_AUTO_APPROVE_UNTIL).getTime()
}
