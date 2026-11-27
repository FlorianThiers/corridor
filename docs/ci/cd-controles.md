# CD-controles (CI/CD)

Deze repo draait op GitHub Actions. Basisbranch voor PRs: **`develop`** (indien aanwezig, anders de default branch).

## Workflows

| Workflow | Trigger | Doel |
| --- | --- | --- |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | `pull_request` | Lint (`npm run lint`), typecheck (`npm run typecheck`), build (`npm run build`) met npm-cache en concurrency. |
| [`.github/workflows/smoke-deploy.yml`](../../.github/workflows/smoke-deploy.yml) | `deployment_status` (Vercel, `success`) | Korte Playwright-smoke (&lt; 2 min) tegen `target_url` (preview en production). |
| [`.github/workflows/supabase-migrations.yml`](../../.github/workflows/supabase-migrations.yml) | `pull_request` | Overzicht nieuwe/gewijzigde migraties + sticky PR-comment; optioneel pending op read-only DB. |

### Playwright smoke

- Tests staan in [`e2e/smoke.spec.ts`](../../e2e/smoke.spec.ts) met tag `@smoke`.
- Alleen GET-paden (`/`, `/agenda`) en openen van de login-dialoog (geen inloggen, geen formulieren).
- Alleen Chromium; concurrency per deployment; job-timeout 5 min (tests doel &lt; 2 min).
- Config: [`playwright.config.ts`](../../playwright.config.ts) — `PLAYWRIGHT_BASE_URL` op deploy-URL.

Op **`master`** bestaat daarnaast een uitgebreidere [e2e-workflow](../../.github/workflows/) met lokale mock-Supabase; die wordt op `develop` niet gedupliceerd.

### Optionele repository secrets

| Secret | Gebruik |
| --- | --- |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Header `x-vercel-protection-bypass` voor preview-smoke achter Vercel Deployment Protection. **Zonder secret:** preview-smoke wordt overgeslagen (melding in job summary), production smoke draait wel. |
| `SUPABASE_DB_URL_READONLY` | Read-only Postgres-URL om te tonen welke PR-migraties nog niet in `supabase_migrations.schema_migrations` staan. **Zonder secret:** alleen bestandslijst in summary/comment; workflow faalt niet. |

Er worden **geen** migraties automatisch toegepast (`db push` wordt nooit gedraaid).

## Lokaal testen

```bash
npm ci
npm run lint
npm run typecheck
npx playwright install chromium   # eenmalig
npx playwright test --list
```

Smoke tegen een live URL (optioneel met bypass):

```bash
PLAYWRIGHT_BASE_URL=https://jouw-preview.vercel.app \
VERCEL_AUTOMATION_BYPASS_SECRET=... \
npm run test:e2e:smoke
```

Migratiecheck (vereist `git fetch origin develop`):

```bash
GITHUB_BASE_REF=develop node scripts/ci/supabase-migration-check.mjs
```

Deze workflows worden via PR naar `develop` geleverd; secrets blijven optioneel in GitHub repository settings.