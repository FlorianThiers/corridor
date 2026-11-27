import assert from 'node:assert/strict'

import { authErrorMessage, friendlyAuthError, normalizeAuthEmail } from './auth-client'

assert.equal(normalizeAuthEmail('  Matty@Example.com  '), 'matty@example.com')
assert.equal(normalizeAuthEmail('user@corridor.gent'), 'user@corridor.gent')

assert.equal(authErrorMessage({ message: 'Invalid login credentials' }), 'Invalid login credentials')
assert.match(
  friendlyAuthError('Invalid login credentials', 'fallback'),
  /Onjuist e-mailadres of wachtwoord/
)
assert.match(
  friendlyAuthError(authErrorMessage({ message: 'Invalid login credentials' }), 'fallback'),
  /Onjuist e-mailadres of wachtwoord/
)
assert.equal(
  friendlyAuthError('Email not confirmed', 'fallback'),
  'Je e-mailadres is nog niet bevestigd. Check je inbox (ook spam) of vraag een nieuwe link aan.'
)

console.log('auth-client.selftest: ok')
