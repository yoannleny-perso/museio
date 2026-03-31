# 20 Portfolio Schema And RLS Log

## Created Schema

Added migration:

- `app_build/museio_app/infra/supabase/migrations/20260331_000001_portfolio_persistence.sql`

The migration creates:

- `portfolio_settings`
- `portfolio_photos`
- `portfolio_videos`
- `portfolio_music_releases`
- `portfolio_events`
- `portfolio_featured_cards`
- `touch_updated_at()` trigger function
- updated-at triggers on all Portfolio tables
- unique handle index
- owner index and portfolio sort indexes
- private storage bucket `portfolio-media`
- storage object owner policies

## Ownership Model

- Every persisted Portfolio record is owned by `owner_user_id`.
- Collection rows also carry `portfolio_id`.
- Public handle uniqueness is global.
- Handle validation is lowercase + hyphen-safe and server-enforced.

## RLS Model

Owner CRUD:

- authenticated users can only read/write rows where `owner_user_id = auth.uid()`

Public read:

- anon and authenticated users can only read Portfolio records tied to:
  - `visibility = 'public'`
  - non-empty handle

Storage:

- object access is constrained to the first path segment matching `auth.uid()`

## Verification Evidence

Local Postgres verification confirmed:

- all six Portfolio tables exist
- `portfolio-media` bucket exists and is private
- public and owner policies exist on every Portfolio table

## Hosted Project Status

Hosted Supabase was probed with the provided service role key and returned:

- `PGRST205`
- `Could not find the table 'public.portfolio_settings' in the schema cache`

That means the hosted project does not yet have the Portfolio schema applied.

## Important Caveat

The local Supabase CLI did not correctly discover the migration/seed files from the current `infra/supabase` repo layout during `supabase db reset`.

Because of that, local schema verification in this phase used a direct `psql -f ...migration.sql` apply step against the local stack.

## Risks

- Hosted production verification is blocked until remote migrations are applied.
- The local CLI path-discovery issue should be fixed before this becomes a team workflow dependency.
