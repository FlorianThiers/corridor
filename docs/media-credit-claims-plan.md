# Photo credit-claim system (plan only)

This document describes a future workflow so uploaders and artists can claim or correct photo credit on Corridor zone media, without duplicating assets in Urban Culture.

## Goals

- Let authenticated users propose credit for a specific `zone_photos` row (or history manifest id later).
- Keep moderation human-in-the-loop: admins approve or reject claims.
- On approval, update authoritative credit fields on the media row (`credit`, `artist_tag`, optionally `media_source`).

## Data model: `media_credit_claims`

| Column | Type | Notes |
|--------|------|--------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `media_id` | `uuid` NOT NULL | FK → `zone_photos.id` ON DELETE CASCADE |
| `claimant_user_id` | `uuid` NOT NULL | FK → `auth.users` / `public.users` |
| `claimant_display_name` | `text` NOT NULL | Snapshot at submit time |
| `message` | `text` | Free text: relationship to photo, preferred credit line |
| `status` | `text` NOT NULL | `pending` \| `approved` \| `rejected`, default `pending` |
| `reviewed_by` | `uuid` | Admin user id |
| `reviewed_at` | `timestamptz` | Set on approve/reject |
| `created_at` | `timestamptz` NOT NULL | `now()` |

Indexes: `(media_id, status)`, `(claimant_user_id, created_at DESC)`.

Optional later: `proposed_credit`, `proposed_artist_tag` columns if claims should not parse `message`.

## RLS

- **Claimant (authenticated):** `INSERT` own rows (`claimant_user_id = auth.uid()`); `SELECT` own rows.
- **Admin roles** (`admin`, `programmer`, `bestuurder` via `public.users.role`): `SELECT` all; `UPDATE` `status`, `reviewed_by`, `reviewed_at`.
- **Public / anon:** no access.

## Approval side effects

When `status` → `approved` (single transaction):

1. Parse or copy proposed credit from claim into `zone_photos.credit` / `artist_tag`.
2. Set `zone_photos.media_source` to `upload` when claimant is the uploader; leave unchanged if only typo fix.
3. Set `zone_photos.updated_at` so UC `updated_since` sync picks up the change.
4. Reject other `pending` claims for the same `media_id` (optional policy).

Rejection: no change to `zone_photos`; optional notification email later.

## API surface (future)

- `POST /api/v1/media/claims` — create pending claim (session auth, not UC API key).
- `GET /api/beheer/media/claims` — admin queue.
- `POST /api/beheer/media/claims/:id/approve` \| `reject` — admin action.

The existing read-only `GET /api/v1/media` (Bearer `CORRIDOR_MEDIA_API_KEY` or `CORRIDOR_AGENDA_API_KEY`) remains the UC sync entry point.

## UI (future)

- Zone photo detail / profile: “Claim credit” if `submitted_by` matches or user attests in `message`.
- Admin beheer tab: queue with photo thumb, current credit, claimant message, approve/reject.

## Out of scope for v1

- History manifest claims (separate table keyed by manifest id).
- Automated face detection for `has_recognisable_people` (stays default `true` until manually set).
