# 40 Booking To Job Validation Report

## Verification Summary

Phase 4 creator operations, client linkage, and job draft conversion were verified locally against the Supabase-backed implementation.

## Workspace Verification

- `pnpm typecheck` passed
- `pnpm lint` passed
- `pnpm test` passed
- `pnpm build` passed
- `supabase db reset --yes` passed with the new operations migration

## Operational Verification

Verified with a live local API process against local Supabase:

- creator-only inbox access works
- creator-only request detail works
- outsider without a Portfolio receives setup-state inbox and cannot open another creator’s request detail
- internal notes persist and remain attached to the booking request
- invalid status transitions return `409`
- accepting a booking request creates a linked client and exactly one job draft for that request
- duplicate accept attempts are rejected with `409`
- two accepted requests from the same requester email deduplicate to one client within the creator scope
- original requester snapshot remains intact after conversion
- multi-slot booking requests survive conversion into the job draft model

Observed results from the live validation run:

- outsider detail access returned `404`
- invalid transition returned `409`
- first accepted request produced a job draft with `1` slot
- second accepted request produced a second job draft with `2` slots
- creator-scoped client count: `1`
- creator job count: `2`
- both booking requests linked to job ids successfully

## Timeline Verification

Verified timeline coverage for accepted requests includes:

- `submitted`
- `internal-note-added`
- `status-changed`
- `client-linked`
- `job-draft-created`

## Hosted Runtime Caveat

The previously documented hosted Node trust-store caveat still applies on this machine:

- hosted server-side runtime verification can still be affected by `SELF_SIGNED_CERT_IN_CHAIN`

This phase’s verification was completed locally against the durable migration path.

## Approval Gates

- Approve the creator workflow and conversion rules based on the live verification pass.
- Approve keeping hosted runtime smoke testing separate until the trust-store issue is resolved outside app code.
