# Museio Temporary Constitution

## Status

This constitution is the temporary governance baseline for the current workspace.

It applies until it is replaced or amended by an approved, permanent constitution.

## Controlling Requirement Set

Until superseded, the controlling requirements are:

1. `MASTER_PROMPT.md`
2. `docs/03_portfolio_finance_truth.md`
3. `docs/05_data_states_and_integrations.md`
4. every other file in `docs/`

If documents conflict:

- `docs/03_portfolio_finance_truth.md` is authoritative for Portfolio and Finance
- `docs/05_data_states_and_integrations.md` is authoritative for production architecture and monorepo direction
- other files in `docs/` provide supporting requirements and acceptance criteria
- `MASTER_PROMPT.md` remains binding unless it conflicts with the two files above

## Mission

Museio must be rebuilt as a production-grade artist operating system with:

- a mobile creator workspace
- a public web portfolio and booking experience
- trustworthy booking, invoicing, payment, payout, finance, and tax workflows

The Figma seed is a visual and interaction reference only. It is not trusted production architecture.

## Non-Negotiable Technology Baseline

The production system must use:

- Expo / React Native for `apps/mobile`
- Next.js for `apps/web`
- NestJS for `apps/api`
- Supabase for Postgres, Auth, Storage, and Realtime
- Stripe Connect for payments, deposits, split payouts, connected accounts, and payout flows
- shared TypeScript contracts across mobile, web, and API

## Required Repository Shape

The default production repository shape is:

```text
apps/
  mobile/
  web/
  api/
packages/
  ui/
  types/
  validation/
  domain/
  config/
  analytics/
infra/
  supabase/
production_artifacts/
docs/
```

Any deviation requires an ADR and explicit approval.

## Architecture Principles

1. No thick-client business logic.
2. Clients own presentation, interaction state, and safe optimistic UX only.
3. NestJS owns orchestration, policy checks, workflow rules, signed public actions, and integration coordination.
4. Postgres and server-side write paths own durable truth and invariants.
5. Supabase is a platform layer, not the entire application architecture.
6. Stripe is not the application source of truth for Museio business state.
7. Shared TypeScript and validation contracts must be used across every boundary.
8. Public web is a first-class product surface, not a mobile fallback.

## Domain Requirements

### Portfolio

Portfolio must follow `docs/03_portfolio_finance_truth.md`.

This includes:

- separate edit mode and live mode
- a thumb-first authenticated builder
- a public live portfolio at `/:handle`
- separation between page orchestration/settings and content collections
- safe scoped delete behavior
- theme studio evolution
- native booking entry within the portfolio experience

### Finance

Finance must follow `docs/03_portfolio_finance_truth.md`.

This includes:

- replacing the thin dashboard with a real finance workspace
- authoritative invoice aging
- payment-derived financial state
- explicit forecast semantics
- Australia-first locale and currency defaults
- product-native Stripe account, payout, deposit, and balance flows
- Tax Centre as a first-class area

## Workflow Rules

1. Do not start implementation from the Figma seed.
2. Audit before building.
3. Extract tokens and components before feature implementation.
4. Define contracts and state models before wiring complex UI.
5. Build in bounded vertical slices.
6. Produce artifacts and evidence after major milestones.
7. Do not preserve unsafe legacy behavior for delete semantics, public URLs, routing hacks, or finance approximations.

## State And Contract Rules

1. Important workflows must use explicit typed states.
2. Status enums must be centralized in shared domain packages.
3. Public actions must use explicit signed and revocable token models where sensitive.
4. Availability, money, tax, payouts, publish state, and booking state must not be client-authored truth.
5. Validation must be shared and enforced on both client and server boundaries.

## Delivery Rules

Every major slice must include:

- happy path
- loading state
- empty state
- validation state
- permission-denied state where relevant
- failure state
- mobile-first UX validation
- typed tests

## Change Control

Changes to this constitution require:

1. a documented reason
2. the affected files or domains
3. an ADR if the change affects architecture or boundary rules
4. explicit approval before implementation proceeds under the new rule

## Temporary Governance Note

This constitution was bootstrapped from the current workspace because the original constitution and `.agents/` system were missing. It should be treated as binding for planning and scaffold work until replaced by an approved permanent governance set.
