# 25 Hosted Portfolio Migration Log

## Objective

Apply the approved Portfolio schema to the hosted Supabase project with a supported, repeatable workflow.

## Hosted Target

Executed on March 31, 2026 against the new hosted Supabase project configured in workspace environment files.

Confirmed present in operator environment:

- hosted Supabase URL
- hosted publishable key
- hosted service role key
- hosted DB password

## Supported Workflow Used

The hosted migration was applied through the official Supabase CLI using a direct database URL generated from environment variables.

Durable command path now used by the repo:

- `node ./scripts/supabase/push-hosted.mjs`

That helper builds the hosted `--db-url` at runtime and runs:

- `supabase db push --db-url <generated-url> --include-all`

No secrets were written into source or markdown artifacts.

## Connection Detail That Mattered

The direct `db.<project-ref>.supabase.co` host for this project resolved to IPv6 only in this shell and was not reachable from this machine.

To keep the workflow supported and durable, the hosted push was executed against the project's reachable Supabase pooler host defined in local environment configuration.

## Result

Hosted migration apply succeeded.

Observed CLI result:

- migration `20260331_000001_portfolio_persistence.sql` applied successfully
- a follow-up run returned `Remote database is up to date.`

## Hosted Schema Outcome

Post-migration verification confirmed the hosted project now contains:

- `portfolio_settings`
- `portfolio_photos`
- `portfolio_videos`
- `portfolio_music_releases`
- `portfolio_events`
- `portfolio_featured_cards`

Hosted storage also now contains:

- private bucket `portfolio-media`

## Assumptions

- the operator shell keeps `.env.local` out of source control
- the hosted pooler host and user remain valid for this Supabase project
- the team accepts a direct `--db-url` push as the standard hosted apply path for this repo

## Risks

- future hosted pushes will fail if the pooler host or DB user changes and local env is not updated
- this machine still has a Node TLS certificate-chain issue when server-side Supabase JS calls the hosted auth/data APIs

## Approval Gate

Approve the repo-standard hosted apply path as:

- `pnpm supabase:push:hosted`

and treat the hosted schema as applied for the Portfolio slice.
