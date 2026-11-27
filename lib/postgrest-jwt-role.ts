/**
 * Spiegelt public.read_request_jwt_role() in SQL (beide PostgREST JWT-vormen).
 * Houd in sync met supabase/migrations/20261126120000_users_rls_select_hardening.sql
 */
export function readPostgrestJwtRole(
  claimRole: string | null | undefined,
  claimsJson: string | null | undefined
): string | null {
  const direct = claimRole?.trim()
  if (direct) return direct

  if (!claimsJson?.trim()) return null

  try {
    const parsed = JSON.parse(claimsJson) as { role?: unknown }
    const role = typeof parsed.role === 'string' ? parsed.role.trim() : ''
    return role || null
  } catch {
    return null
  }
}

export function isServiceRoleJwt(
  claimRole: string | null | undefined,
  claimsJson: string | null | undefined
): boolean {
  return readPostgrestJwtRole(claimRole, claimsJson) === 'service_role'
}