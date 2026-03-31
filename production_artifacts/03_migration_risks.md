# 03 Migration Risks

## Summary

The main migration risk is not visual parity. It is accidentally carrying seed architecture and legacy-like workflow shortcuts into a production rebuild. The seed is compelling as a visual demo, but dangerous as a runtime foundation.

## Critical Risks

## 1. Governance Input Risk

Risk:

- `.specify/memory/constitution.md` and `.agents/` files referenced by the repo are missing

Why it matters:

- implementation could begin without the intended planning rules and project constraints

Mitigation:

- obtain missing files or explicitly waive them before implementation

Approval gate:

- confirm whether these files will be supplied or waived

## 2. Architecture Direction Risk

Risk:

- `docs/04...` and `MASTER_PROMPT.md` partly conflict with `docs/05...` on production architecture

Why it matters:

- wrong early setup causes expensive foundation churn

Mitigation:

- approve `docs/05_data_states_and_integrations.md` as architecture truth
- record any deviation in ADR form

Approval gate:

- approve Expo + Next.js + NestJS + Supabase hybrid modular monolith

## 3. Domain Enum Drift Risk

Risk:

- booking/job/invoice/payment/tax states differ across docs and seed

Why it matters:

- workflow bugs, unreadable analytics, broken filters, and invalid transitions

Mitigation:

- define canonical enums and transition maps centrally in `packages/domain`
- require shared usage across mobile/web/api

Approval gate:

- approve final enum/state-machine set before feature implementation

## 4. Portfolio Data-Model Risk

Risk:

- seed models portfolio as an editable block array with permissive content payloads

Why it matters:

- dangerous delete behavior can recur
- content ownership becomes ambiguous
- publishing and analytics become brittle

Mitigation:

- separate `portfolio_settings` orchestration from content collections
- give section instances durable identifiers
- scope deletes to section instances, never content type globally

Approval gate:

- approve portfolio settings/content split and section-instance model

## 5. Finance Truth Risk

Risk:

- seed finance semantics derive from jobs and mock arrays

Why it matters:

- overdue logic, forecast, GST, deposits, and payouts become untrustworthy

Mitigation:

- derive finance views only from canonical invoices, payments, payouts, adjustments, and tax records
- make Stripe webhook writes durable and auditable

Approval gate:

- approve finance/tax contract-first rebuild and rejection of job-proxy calculations

## 6. Public Route Security Risk

Risk:

- seed implies public quote/invoice/payment/share flows without robust signed-token contracts

Why it matters:

- sensitive actions may be guessable, non-revocable, or environment-fragile

Mitigation:

- define signed, expiring, revocable public action tokens
- separate public fetch from public mutation permissions

Approval gate:

- approve signed-link security model before public flow implementation

## 7. Cross-Platform UI Risk

Risk:

- seed relies on browser-only APIs and HTML5 drag/drop

Why it matters:

- direct reuse will break Expo Native and complicate cross-platform sharing

Mitigation:

- extract tokens and patterns only
- rebuild platform-specific interactions where needed

Approval gate:

- approve selective extraction, not component transplantation

## 8. Integration Truth Risk

Risk:

- Google Calendar, Calendly, Stripe, messaging, and analytics are represented visually but not contractually

Why it matters:

- implementation can drift into stub-driven UI with hidden backend gaps

Mitigation:

- define each integration contract and failure mode before UI completion
- model revoke/error/retry/safe-mode states explicitly

Approval gate:

- approve integration contract checklist before those slices begin

## 9. Missing State Coverage Risk

Risk:

- seed under-specifies offline, failure, permission-denied, expired token, and sync-error states

Why it matters:

- the rebuilt app could look polished but fail under real conditions

Mitigation:

- require state matrices for each critical workflow
- include acceptance criteria for happy/loading/empty/error/denied/offline variants

Approval gate:

- approve state-matrix requirement for all critical flows

## 10. Analytics Credibility Risk

Risk:

- portfolio insights are currently mock-only and could be implemented as vanity analytics with inconsistent event semantics

Why it matters:

- creators may make publishing decisions from misleading data

Mitigation:

- define analytics events, attribution rules, and aggregation windows centrally

Approval gate:

- approve analytics event taxonomy before insights implementation

## Production-Relevant Anti-Patterns Most Likely To Cause Regressions

- `localStorage` as source of truth
- `setTimeout` for auth/callback/payment illusions
- page-local Stripe, tax, and finance calculations
- generic status strings across domains
- destructive confirms for important mutations
- direct `window.location` and environment-sensitive URL generation
- browser-only share/copy code in feature pages
- `any`-typed portfolio and form payloads

## Recommended Risk Controls

1. Freeze truth hierarchy before coding.
2. Finalize domain enums and state machines before UI slices.
3. Build `apps/api` contracts before wiring complex seed flows.
4. Extract design tokens before porting UI layouts.
5. Validate every public action with signed-token contracts.
6. Make Finance and Tax acceptance dependent on authoritative records, not UI calculations.
7. Require explicit failure and edge states in every vertical slice.

## Assumptions

- The team wants to avoid recreating the old thick-client problems.
- The seed is intended to accelerate design extraction, not preserve internal logic.
- Production implementation will happen after these artifacts are approved.

## Risks Of Delay

- Waiting on governance inputs may slow implementation start.
- Not waiting creates higher rework and correctness risk later.

This is a good delay to take.

## Approval Gates

- Gate 1: approve missing-governance-file handling.
- Gate 2: approve architecture truth source.
- Gate 3: approve canonical enums/state machines.
- Gate 4: approve portfolio settings/content split.
- Gate 5: approve finance/tax authority model.
- Gate 6: approve signed public route/token model.
