# 26 Migration Workflow Hardening Log

## Problem

The repo had two migration workflow issues:

- local Supabase discovery was brittle because the project had previously lived under a nonstandard path
- hosted pushes depended on one-off shell commands instead of an env-driven repo workflow

## Local Normalization

The repo already uses the standard Supabase layout:

- `app_build/museio_app/supabase/config.toml`
- `app_build/museio_app/supabase/migrations/20260331_000001_portfolio_persistence.sql`
- `app_build/museio_app/supabase/seed.sql`

Verified local commands:

- `supabase start`
- `supabase db reset --yes`

Both now discover the migration and seed without `psql -f`.

## Hosted Normalization Added In This Phase

Added a repo-managed hosted push helper:

- `app_build/museio_app/scripts/supabase/push-hosted.mjs`

Added root script:

- `supabase:push:hosted`

Added matching hosted connection env placeholders in:

- `app_build/museio_app/env.example`

The helper reads:

- `SUPABASE_DB_HOST`
- `SUPABASE_DB_PORT`
- `SUPABASE_DB_NAME`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`

and then runs the official CLI with a generated `--db-url`.

It also prefers the workspace-local CLI binary when a global `supabase` binary is not on `$PATH`.

## Verification

Verified on March 31, 2026:

- `node ./scripts/supabase/push-hosted.mjs`

Result:

- hosted migration applied successfully
- second run reported `Remote database is up to date.`

## Durable Team Workflow

Normal workflow is now:

1. local development: `pnpm supabase:start`, `pnpm supabase:reset`
2. hosted apply: `pnpm supabase:push:hosted`

`psql -f` remains fallback-only for low-level diagnostics.

## Assumptions

- operators will populate hosted DB host/user/password env values before running the hosted push
- `.env.local` or CI secrets remain the source for hosted connection material

## Risks

- hosted push still depends on correct project-specific pooler host/user values
- a future CLI major version could change `db push` behavior and require minor script updates

## Approval Gate

Approve the env-driven helper as the standard hosted migration process for this monorepo.
