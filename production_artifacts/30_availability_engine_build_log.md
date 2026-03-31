# 30 Availability Engine Build Log

## Summary

Implemented a server-owned availability engine for public booking on top of Supabase-backed Portfolio identity.

## What Was Built

- Shared booking and availability contracts in `packages/types`
- Domain helpers in `packages/domain` for:
  - public availability window generation
  - conflict subtraction
  - multi-slot request normalization
  - slot-fit validation
- Zod validation in `packages/validation`
- Supabase migration `20260331000002_booking_foundations.sql`
- API orchestration in `apps/api/src/booking`

## Availability Model

Inputs:

- base weekly availability rules
- creator-authored unavailable blocks
- future external calendar blocks
- blocking booking request slots

Output:

- public-safe availability days with exposed windows only

## Server Rules Enforced

- private portfolios cannot expose booking availability
- missing handles return not-found
- submitted slots must fit the currently exposed availability windows
- conflicting or blocked slots are rejected with `409`
- creator inbox access is owner-scoped

## Important Contract Refinement

The first end-to-end verification exposed a UX contract issue: authenticated users without a Portfolio were receiving a hard `404` when opening the creator booking inbox. This was hardened so the inbox now returns a valid setup state:

- `isConfigured: false`
- empty availability
- empty request list

Write actions still require a Portfolio-backed creator identity.

## Migration Notes

The initial migration naming pattern caused version collisions in Supabase because only the leading timestamp token is used for ordering. The durable fix was renaming migrations to:

- `20260331000001_portfolio_persistence.sql`
- `20260331000002_booking_foundations.sql`

After that, `supabase db reset --yes` applied both migrations cleanly.

## Assumptions

- Booking availability must remain server-owned and not be recomputed from client-only state.
- External calendar sync will be additive through overlay blocks rather than replacing the base model.

## Risks

- Timezone conversion remains a sensitive area and should keep strong regression coverage as richer booking UX is added.
- The current creator UI supports one base window per day even though the contracts allow more than one in the future.

## Approval Gates

- Approve the current availability blocking policy for `submitted`, `under-review`, and `accepted`.
- Approve the setup-state contract for creators without a Portfolio.
