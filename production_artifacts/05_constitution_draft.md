# 05 Constitution Draft

## Summary

The drafted constitution converts the current workspace docs into a binding temporary rule set for planning and future implementation work.

## Core Decisions Enforced

### Stack

- Expo / React Native for `apps/mobile`
- Next.js for `apps/web`
- NestJS for `apps/api`
- Supabase for Postgres/Auth/Storage/Realtime
- Stripe Connect for payments and payouts

### Contracts And Boundaries

- shared TypeScript contracts are mandatory
- validation must be shared across boundaries
- clients may not own business truth for money, booking, tax, payouts, or publish state
- server-side orchestration and durable persistence own workflow truth

### Domain Corrections

- Portfolio must follow the corrected truth file
- Finance must follow the corrected truth file
- `figma_seed` is explicitly demoted to visual/interaction reference

### Delivery Discipline

- audit before implementation
- extract design system before feature work
- build in bounded vertical slices
- define typed workflow states centrally
- require major-state coverage in each slice

## Constitution Structure

The constitution currently includes:

- source-of-truth hierarchy
- mission
- non-negotiable technology baseline
- required repository shape
- architecture principles
- domain requirements
- workflow rules
- state and contract rules
- delivery rules
- change control

## Draft Quality Assessment

The constitution is strong enough to:

- govern planning
- prevent stack drift
- prevent thick-client regression
- keep Portfolio and Finance aligned with corrected truth

It is not yet a complete final governance framework for:

- role-based approvals
- ADR templates
- release governance
- long-term contribution policy

Those are future recommendations, not current scope.

## Assumptions

- `docs/05_data_states_and_integrations.md` is the intended architecture authority for the rebuilt product
- the temporary constitution should optimize for clarity and enforceability over exhaustive process detail

## Risks

- later governance additions may introduce finer-grained operating rules
- missing original governance files may have contained nuances not recoverable from current docs alone

## Approval Gates

- Gate 1: approve the source-of-truth hierarchy in the constitution
- Gate 2: approve the enforced stack baseline
- Gate 3: approve the no-thick-client rule as non-negotiable
- Gate 4: approve corrected Portfolio and Finance truth as binding constitutional requirements
