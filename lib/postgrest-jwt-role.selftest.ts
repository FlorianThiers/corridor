import assert from 'node:assert/strict'

import { isServiceRoleJwt, readPostgrestJwtRole } from './postgrest-jwt-role'

assert.equal(readPostgrestJwtRole('service_role', null), 'service_role')
assert.equal(readPostgrestJwtRole('  authenticated  ', ''), 'authenticated')

assert.equal(
  readPostgrestJwtRole('', '{"role":"service_role","sub":"00000000-0000-0000-0000-000000000001"}'),
  'service_role'
)
assert.equal(readPostgrestJwtRole(undefined, '{"role":"authenticated"}'), 'authenticated')

assert.equal(readPostgrestJwtRole(null, null), null)
assert.equal(readPostgrestJwtRole(null, 'not-json'), null)

assert.equal(isServiceRoleJwt(null, '{"role":"service_role"}'), true)
assert.equal(isServiceRoleJwt('service_role', '{"role":"authenticated"}'), true)
assert.equal(isServiceRoleJwt(null, '{"role":"authenticated"}'), false)

console.log('postgrest-jwt-role.selftest: ok')