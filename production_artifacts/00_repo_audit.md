# 00 Repo Audit

## Scope

This audit covers:

- `README.md`
- `MASTER_PROMPT.md`
- every file present in `docs/`
- `app_build/figma_seed/` as a visual and interaction seed only

This checkout does **not** contain:

- `.specify/memory/constitution.md`
- `.agents/agents.md`
- `.agents/` skills/workflows/rules of any kind

Those missing files are material audit inputs according to `README.md` and `MASTER_PROMPT.md`, so this audit treats them as governance gaps and approval blockers.

## Executive Summary

The repo direction is clear: rebuild Museio as a spec-first, production-grade platform and do not trust the Figma seed for architecture, money logic, routing authority, or workflow state. The strongest requirement sources are:

- `docs/03_portfolio_finance_truth.md` for Portfolio and Finance
- `docs/05_data_states_and_integrations.md` for system architecture, data boundaries, and monorepo shape

The Figma seed contains strong visual intent for:

- portfolio/public surfaces
- thumb-first editing patterns
- operational card layouts
- tax/availability/payout concept coverage

The Figma seed is not production-safe architecture. It is a Vite SPA with:

- mock in-memory domain state
- `localStorage` persistence
- browser-only APIs
- timer-driven callbacks
- route shortcuts
- generic string statuses
- UI-owned finance, tax, and booking semantics
- numerous `any`-typed payloads and component props

## Source-of-Truth Hierarchy

Recommended precedence for planning:

1. `docs/03_portfolio_finance_truth.md`
2. `docs/05_data_states_and_integrations.md`
3. `docs/02_product_requirements.md`
4. `docs/06_execution_plan_and_acceptance.md`
5. `docs/07_figma_handoff.md`
6. `docs/04_architecture_and_stack.md`
7. `MASTER_PROMPT.md`
8. `app_build/figma_seed/`

Reason:

- `docs/03...` explicitly overrides earlier loose assumptions.
- `docs/05...` is the clearest architecture decision and explicitly replaces earlier guidance.
- `docs/04...` and `MASTER_PROMPT.md` partially conflict with `docs/05...` on mobile/backend shape.

## Key Contradictions And Gaps

### 1. Missing governance inputs

The repo asks for a constitution and `.agents/` workflows, but they are absent from this checkout. That means:

- no project constitution to validate non-negotiables
- no agent rules/project-context file referenced by `MASTER_PROMPT.md`
- no reusable workflows/skills to follow or audit

Impact:

- planning can proceed
- implementation should not begin until either those files are supplied or their absence is explicitly waived

### 2. Architecture contradiction between docs

`docs/04_architecture_and_stack.md` and `MASTER_PROMPT.md` lean toward:

- Next.js web
- Capacitor wrapper
- package/services structure

`docs/05_data_states_and_integrations.md` recommends:

- `apps/mobile` = Expo / React Native
- `apps/web` = Next.js
- `apps/api` = NestJS
- shared packages for UI/domain/validation/config
- hybrid modular monolith

Recommendation:

- treat `docs/05_data_states_and_integrations.md` as the architecture source of truth
- record this as an approval gate before implementation

### 3. Route/state model drift between prompt and seed

Docs require signed public routes and canonical workflow states. The seed uses:

- `createBrowserRouter`
- public routes without signed token models except implied placeholders
- local step state and optimistic transitions with no backend authority

Impact:

- visual routing patterns are usable
- route contracts and all workflow semantics must be rebuilt

### 4. Domain status drift

Docs define explicit canonical states for booking, job, invoice, payment, publish, calendar, and tax. The seed instead mixes statuses like:

- `requested`
- `drafted`
- `invoice-sent`
- `paid`
- `pending`
- `quoted`
- `declined`

Problems:

- statuses are screen-specific instead of domain-owned
- invoice/payment state is derived from job state in places
- docs themselves contain some enum differences between `MASTER_PROMPT.md` and `docs/05...`

Recommendation:

- finalize enums centrally in `packages/domain`
- define transition rules before implementation

## Figma Seed Audit

## What Is Strong And Worth Extracting

### Visual language

- operational UI has a coherent soft-card SaaS language
- portfolio V3 has a stronger premium/editorial direction
- theme concepts already exist and are richer than a basic palette switcher
- mobile-first spacing and stacked layouts are generally solid

### Reusable primitives visible in the seed

- buttons
- cards
- tabs
- badges
- dialogs/sheets
- form controls
- chart shells
- section cards
- portfolio media blocks
- app-shell navigation patterns

### Product breadth represented visually

The seed does a good job showing breadth for:

- portfolio builder and public portfolio
- public booking
- finance
- tax centre
- connected calendars
- messages
- jobs/edit job/payment concepts

## Figma-Generated Anti-Patterns To Reject

### Architecture anti-patterns

- global `AppContext` used as fake app backend
- mock data as runtime source of truth
- `localStorage` used as persistence for core portfolio state
- route-level business logic in pages
- no typed backend contracts
- heavy browser API assumptions not compatible with Expo Native

### Workflow anti-patterns

- fake async with `setTimeout`
- alert/confirm based UX for destructive or important actions
- publish/share/payment/connect flows without server-side validation
- finance totals derived from jobs instead of invoice/payment records
- deposit and payout logic held in page-local mocks

### Type-system anti-patterns

- repeated `any`
- flexible `content: any` payloads for critical portfolio blocks
- ungoverned status strings
- no shared validation layer

### Platform anti-patterns

- `window.location`, `window.open`, `navigator.share`, `document.execCommand`, clipboard fallbacks in page code
- `react-dnd` HTML5 backend for builder interactions, which is unsuitable as-is for Expo Native
- generic Stripe dashboard links instead of account-aware product flows

## Missing States And UX Coverage

The docs require loading, empty, error, offline, and permission-denied states for all critical workflows. The seed mostly covers happy-path and a few empty states, but misses or under-specifies:

- auth/session recovery states
- expired signed-link states for quote/invoice/payment actions
- portfolio publish blocked states beyond basic handle reminder
- partial payment, payment retry, refund, and payout failure states
- calendar revocation and safe-mode booking closure states
- booking conflict resolution states
- attachment upload failure/retry states
- realtime reconnect and stale data states
- offline mobile behavior for creator workflows
- RLS/authorization-denied states

## Missing Backend Contracts

These production contracts are implied by docs but absent from the seed:

- handle availability and publish eligibility contract
- portfolio settings vs section-instance content contracts
- public portfolio fetch contract with visibility filtering
- booking availability quote/check contract
- booking request creation contract with multi-slot payload
- quote accept/decline tokenized contract
- invoice issue/send/view/pay contracts
- deposit schedule and balance generation contracts
- Stripe Connect onboarding/account session contracts
- payment webhook ingestion and reconciliation contracts
- payout ledger and split payout contracts
- tax period aggregation/export contracts
- calendar connection/sync/refresh/revoke contracts
- message thread/message delivery/read receipt contracts
- analytics event ingestion and aggregation contracts

## Portfolio Findings

The seed supports the right product idea:

- edit mode vs live mode are visibly distinct
- there is a thumb-first builder
- public portfolio is premium and conversion-oriented

But the data model is not trustworthy:

- portfolio lives in mock structures and `localStorage`
- deletion is block-array deletion, not safe scoped content deletion
- `content: any` prevents contract safety
- analytics are mock-only
- handle/public state are not server-enforced

Production implication:

- keep the UX concept
- replace the architecture completely

## Finance Findings

The seed visually extends Finance well beyond the old 3-widget dashboard, but the logic is still mock-grade:

- earnings derived from job status
- outstanding based on `invoice-sent` jobs
- GST is estimated directly from earnings
- deposits, payouts, and reports are local mock arrays
- Stripe uses a generic dashboard URL

Production implication:

- keep layout direction and information hierarchy where useful
- rebuild all calculations from canonical invoices, payments, payouts, and tax records

## Recommended Production Monorepo Structure

```text
apps/
  mobile/                 # Expo / React Native creator app
  web/                    # Next.js public web + signed client-facing views
  api/                    # NestJS modular monolith / orchestration layer
packages/
  ui/                     # shared design tokens + cross-surface primitives
  types/                  # transport-safe DTO/types for clients
  validation/             # Zod schemas and form/API validation
  domain/                 # enums, state machines, domain models, policies
  config/                 # env helpers, flags, constants
  analytics/              # event contracts
infra/
  supabase/
    migrations/
    seed/
    policies/
    functions/
production_artifacts/
docs/
  adr/
```

Boundary notes:

- `apps/mobile` owns authenticated creator workflows
- `apps/web` owns portfolio live mode, booking, quote, invoice, payment, job-card, and OG routes
- `apps/api` owns orchestration, policy checks, integrations, signed actions, and durable workflow transitions
- `packages/domain` owns canonical status enums and state transition rules
- `packages/types` and `packages/validation` prevent contract drift across web/mobile/api

## Recommended Immediate Decisions

1. Approve `docs/05_data_states_and_integrations.md` as the runtime architecture source of truth over the older Capacitor-leaning guidance.
2. Confirm whether missing `.agents/` and constitution files will be supplied or explicitly waived.
3. Approve the monorepo package naming above before implementation.
4. Approve a contract-first rewrite of workflow/state semantics rather than attempting seed preservation.

## Assumptions

- The missing `.agents/` and constitution files are absent from this checkout, not merely hidden elsewhere.
- `docs/03_portfolio_finance_truth.md` and `docs/05_data_states_and_integrations.md` are the intended primary truth sources.
- `app_build/figma_seed/` is intentionally disposable architecture and should not be migrated wholesale.

## Risks

- Proceeding without the missing governance files may cause later process rework.
- Proceeding without resolving the Expo vs Capacitor contradiction may create foundation churn.
- Attempting to preserve seed logic will create domain drift and finance/payment defects.

## Approval Gates

- Gate 1: approve waiver or restoration of `.specify/memory/constitution.md` and `.agents/`.
- Gate 2: approve `docs/05...` as architecture truth over older stack notes.
- Gate 3: approve the production monorepo structure and package boundaries.
- Gate 4: approve seed treatment as visual/design reference only.
