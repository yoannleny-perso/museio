# 27 Hosted Portfolio Verification Report

## Verification Status

Hosted Portfolio verification is substantially complete at the schema, RLS, uniqueness, and storage layers.

A separate local runtime blocker remains for Node-based Supabase calls from this machine.

## Verified On Hosted Project

Executed on March 31, 2026.

### Schema

Confirmed hosted tables exist:

- `portfolio_settings`
- `portfolio_photos`
- `portfolio_videos`
- `portfolio_music_releases`
- `portfolio_events`
- `portfolio_featured_cards`

### Policies

Confirmed hosted policies exist for:

- owner write/read on all Portfolio tables
- public read on Portfolio collections when the parent portfolio is public
- owner-scoped storage object read/insert/update/delete on `portfolio-media`

### Storage

Confirmed hosted bucket exists:

- `portfolio-media`
- `public = false`

Confirmed authenticated storage behavior:

- owner-scoped upload succeeded
- uploaded object appeared in `storage.objects`
- owner-scoped delete succeeded
- deleted object was removed from `storage.objects`

### Public/Private Enforcement

Verified with hosted PostgREST + real Supabase auth users:

- authenticated owner insert into `portfolio_settings` succeeded through RLS
- anonymous read returned `0` rows while visibility was `private`
- authenticated owner update to `public` succeeded
- anonymous read returned `1` row after publish

### Handle Uniqueness

Verified with two distinct hosted auth users:

- first owner saved a lowercase handle successfully
- second owner attempting the same handle received `409`
- hosted duplicate error code was `23505`
- hosted duplicate error referenced unique index `portfolio_settings_handle_unique_idx`

## Could Not Fully Verify From This Machine

The local NestJS runtime cannot currently complete hosted Supabase JS calls in this shell because Node reports:

- `SELF_SIGNED_CERT_IN_CHAIN`

Observed effects:

- protected API verification against hosted Supabase sessions returns `401`
- public API route verification against hosted Supabase returns `500`

This is a machine-local trust-store problem, not a schema/RLS/storage problem.

## Interpretation

The hosted Portfolio data plane is correctly migrated and enforced.

What remains unverified from this machine is the Node runtime path used by:

- NestJS server-side Supabase calls
- Next.js server-side Supabase calls

## Assumptions

- the hosted verification user data created during this pass was disposable and safe to remove
- the Node certificate-chain issue is environmental rather than caused by Museio application code

## Risks

- until the local or CI trust store is fixed, auth-backed hosted runtime smoke tests cannot be completed honestly from Node in this environment
- future operators could misread the hosted schema success as full runtime readiness unless this caveat stays attached

## Approval Gate

Approve hosted Portfolio as:

- migrated
- RLS-enforced
- storage-ready

but do not mark hosted runtime verification fully complete until the Node trust-store issue is resolved and the Nest/Next hosted smoke tests are rerun.
