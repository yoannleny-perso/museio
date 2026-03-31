# 33 Booking Validation And Test Report

## Verification Summary

Phase 3 booking foundations were verified locally against the durable Supabase-backed implementation.

## Workspace Verification

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed
- `pnpm build` passed

## Local Supabase Verification

- `supabase start` succeeded
- `supabase db reset --yes` succeeded after migration version normalization
- booking migration applied through the standard workflow

## End-To-End Booking Verification

Verified with a live local API process against local Supabase:

- public booking route for private handle returned `403`
- public booking route for missing handle returned `404`
- public booking route for public handle with no availability returned `200` and exposed no availability windows
- creator availability save persisted successfully
- first booking request persisted successfully with `201`
- conflicting request for an already-blocked slot returned `409`
- request inside a manual unavailable block returned `409`
- multi-slot booking request persisted successfully with two child slot records
- creator inbox showed only owner-scoped requests
- authenticated non-creator-without-portfolio inbox returned setup state with `isConfigured: false`
- creator request status update to `under-review` persisted successfully

Observed persisted counts from the verification run:

- `booking_requests`: `2`
- `booking_request_slots`: `3`
- creator availability rules for test creator: `7`
- creator unavailable blocks for test creator: `1`

## Domain Regression Coverage

Added and passed domain tests covering:

- blocking status baseline
- subtracting blocking windows from public availability
- validating requested slots against exposed windows

## Hosted Verification Note

This phase centered on local durable verification. The previously documented hosted Node runtime caveat still applies on this machine:

- server-side Node calls against hosted Supabase can fail with `SELF_SIGNED_CERT_IN_CHAIN`

That caveat does not change the local booking foundation results, but it remains relevant for future hosted runtime smoke tests.

## Assumptions

- Local Supabase is the reliable verification path for this foundation phase.
- Hosted data-plane verification for booking can follow once that Node trust-store issue is resolved or worked around at the environment level.

## Risks

- No automated browser-level flow test exists yet.
- No anti-abuse verification exists yet for public booking submissions.

## Approval Gates

- Approve the current verification bar for Phase 3 foundations.
- Approve deferring hosted runtime smoke tests until the trust-store issue is resolved outside application code.
