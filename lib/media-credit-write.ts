const MAX_CREDIT_LENGTH = 200

export type CreditWriteResult =
  | { ok: true; credit: string | null }
  | { ok: false; error: string }

/**
 * UC may replace only the credit of a published media item.
 * `null` clears the override and restores the Corridor default.
 */
export function parseCreditWriteBody(raw: unknown): CreditWriteResult {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Body must be a JSON object' }
  }

  const keys = Object.keys(raw)
  if (keys.length !== 1 || keys[0] !== 'credit') {
    return { ok: false, error: 'Only the credit field can be updated' }
  }

  const credit = (raw as { credit?: unknown }).credit
  if (credit === null) return { ok: true, credit: null }
  if (typeof credit !== 'string') {
    return { ok: false, error: 'credit must be a string or null' }
  }

  const trimmed = credit.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: 'credit must not be empty; send null to restore the default',
    }
  }
  if (trimmed.length > MAX_CREDIT_LENGTH) {
    return { ok: false, error: 'credit is too long' }
  }
  return { ok: true, credit: trimmed }
}
