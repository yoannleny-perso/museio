# 01 Execution Plan

## Objective

Rebuild Museio as a production-grade monorepo while using `app_build/figma_seed/` only for:

- visual direction
- interaction patterns
- component inventory
- content-model clues

Do not reuse the seed as production architecture.

## Proposed Repository Shape

```text
apps/
  mobile/                 # Expo / React Native creator app
  web/                    # Next.js public web + shareable/signed flows
  api/                    # NestJS orchestration layer
packages/
  ui/                     # shared tokens and primitives
  types/                  # DTOs, API contracts, transport types
  validation/             # Zod schemas and validators
  domain/                 # domain models, enums, state machines, policies
  config/                 # env, feature flags, constants
  analytics/              # event payload contracts
infra/
  supabase/
    migrations/
    seed/
    policies/
    functions/
docs/
  adr/
production_artifacts/
```

## Execution Principles

- Contract-first before screen implementation
- Domain modules before cross-screen UI composition
- Public web as first-class, not an afterthought
- Money, tax, availability, and publish state owned by backend/domain layers
- Shared packages prevent enum and validation drift
- Design-system extraction happens before major feature implementation

## Phase Plan

## Phase 0: Alignment And Audit Closure

Deliver:

- confirm truth hierarchy
- confirm monorepo structure
- confirm missing governance file disposition
- finalize canonical enums and bounded contexts

Outputs:

- approved audit artifacts
- ADR if architecture deviates from `docs/05...`

## Phase 1: Foundation And Monorepo Setup

Deliver:

- workspace setup with `pnpm` and Turborepo
- `apps/mobile`, `apps/web`, `apps/api`
- shared TypeScript config, linting, formatting, testing setup
- `packages/ui`, `packages/types`, `packages/validation`, `packages/domain`
- env/config scaffolding
- CI task graph baseline

Acceptance:

- all apps build
- packages compile independently
- no feature logic copied from seed yet

## Phase 2: Domain Contracts And Data Model

Deliver:

- canonical enums in `packages/domain`
- Zod request/response contracts in `packages/validation`
- transport-safe DTOs in `packages/types`
- Supabase schema/RLS baseline
- NestJS module skeletons

Required modules:

- identity-access
- profiles
- portfolio
- availability
- booking-requests
- clients-crm
- jobs
- quotes
- invoices
- payments
- payouts
- tax-reporting
- messaging
- notifications
- analytics
- calendar-sync

Acceptance:

- public/private route contracts defined
- signed action token model defined
- workflow transitions documented and testable

## Phase 3: Design System Extraction

Deliver:

- token map from seed
- operational component set
- portfolio/public component set
- semantic color system for finance/tax/payment states
- cross-platform token strategy for web and Expo

Acceptance:

- no feature page relies on copied ad hoc seed classes
- primitives exist for buttons, forms, cards, states, navigation, sheets

## Phase 4: Portfolio Vertical Slice

Deliver:

- `apps/mobile`: authenticated portfolio editor shell
- `apps/web`: public `/:handle` live mode
- `apps/api`: portfolio orchestration endpoints
- scoped section instance model
- publish/preview/handle contracts
- starter templates
- analytics event shell

Acceptance:

- edit mode and live mode both work
- live mode hides empty sections
- publish requires valid handle and readiness checks
- delete operations are scoped and safe

## Phase 5: Availability And Booking Vertical Slice

Deliver:

- weekly availability
- blackout/vacation periods
- external overlay ingestion model
- public booking flow
- multi-slot request payloads
- conflict engine and visible error states

Acceptance:

- no double-booking across canonical rules
- public booking payload validated server-side
- revoked calendar/sync-error states handled explicitly

## Phase 6: Jobs, CRM, Quotes, Messaging

Deliver:

- request inbox
- quote send/decline
- client records
- job detail
- job-linked messaging
- notifications foundation

Acceptance:

- quote acceptance can convert to job
- thread permissions are enforced
- unread/read states are durable

## Phase 7: Invoicing, Payments, Deposits, Payouts

Deliver:

- invoice composer
- attachments
- deposit and balance flows
- Stripe Connect onboarding
- payout visibility and split logic
- webhook processing

Acceptance:

- invoice/payment state comes from durable records
- webhook events reconcile internal state
- payout and fee visibility is explicit

## Phase 8: Finance And Tax Centre

Deliver:

- real finance workspace
- invoice aging
- forecast
- payout and fee views
- Tax Centre
- BAS/GST export artifacts
- reserve tracker

Acceptance:

- no finance widget derives from loose job proxies
- locale/currency are coherent and Australia-first
- GST/tax logic is explicit and test-covered

## Phase 9: Hardening

Deliver:

- E2E coverage
- observability
- deep-link validation
- offline/reconnect handling
- accessibility and performance passes

Acceptance:

- critical flows verified across mobile and web
- secure public links tested
- artifact evidence captured in `production_artifacts/`

## Workstream Ownership By App

### `apps/mobile`

- authenticated creator experience
- portfolio builder/editor
- jobs/CRM/messages
- finance/tax/settings
- connected calendars

### `apps/web`

- public portfolio live mode
- public booking flow
- quote/invoice/payment public views
- job-card pages
- OG metadata and public route rendering

### `apps/api`

- orchestration services
- domain policy enforcement
- signed token issuance and verification
- Stripe, Google, Calendly integrations
- analytics ingestion
- tax/report aggregation

## High-Priority Contract Work Before Any Implementation

1. Canonical status enums and transition matrices
2. Portfolio settings vs section-instance content contract
3. Booking request schema, including multi-slot support
4. Quote/invoice/payment tokenized public route contract
5. Stripe onboarding, webhook, payout, and split allocation contract
6. Tax period aggregation and export contract
7. Calendar connection/sync/revocation contract

## Assumptions

- We are planning for a greenfield production monorepo, not an in-place repair of `figma_seed`.
- Expo Native is the intended mobile direction for production.
- Supabase remains the primary data platform, with NestJS orchestrating workflows.

## Risks

- Architecture churn if Expo vs Capacitor is not explicitly resolved.
- Contract churn if canonical enums are postponed until after UI work starts.
- Design-system rework if operational and public surfaces are not split early.

## Approval Gates

- Gate 1: approve the monorepo structure and app/package ownership.
- Gate 2: approve `docs/05...` as architecture truth.
- Gate 3: approve canonical enum/state-machine design before UI implementation.
- Gate 4: approve Phase 3 design-system extraction before feature slices begin.
