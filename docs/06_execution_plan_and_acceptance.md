# 06 — Execution Plan and Acceptance

## Phase 0 — Audit

### Required artifacts
- `production_artifacts/00_repo_audit.md`
- `production_artifacts/01_execution_plan.md`
- `production_artifacts/02_design_system_extraction_plan.md`
- `production_artifacts/03_migration_risks.md`

### Acceptance
- Figma seed fully inventoried
- gap list against requirements exists
- repo structure approved
- priority risks called out

## Phase 1 — Foundations

### Deliver
- monorepo
- Next.js app shell
- Capacitor shell scaffolding
- design tokens package
- shared UI package
- auth plumbing
- route guards
- env handling

### Acceptance
- app boots cleanly
- mobile shell compiles
- tokens and base components extracted
- no business logic embedded in demo components

## Phase 2 — Portfolio vertical slice

### Deliver
- authenticated Portfolio overview
- builder
- preview
- live public page
- theme studio core
- add/reorder/toggle sections
- safe delete
- Book Me integration

### Acceptance
- edit mode and live mode both work
- empty sections hidden in live mode
- publish toggle works with username prerequisite
- starter templates exist
- screenshots and walkthrough artifact exist

## Phase 3 — Availability + booking vertical slice

### Deliver
- availability rules UI
- vacation periods
- public booking flow
- multi-slot booking
- Google Calendar and Calendly overlay scaffolding
- conflict center

### Acceptance
- external blocks affect availability
- booking validation works
- conflict states are visible
- prototype/public flow is testable end to end

## Phase 4 — Jobs + CRM + chat

### Deliver
- request inbox
- quote send/decline
- job detail
- client records
- chat thread UI
- realtime message updates

### Acceptance
- accepted quote becomes job
- chat is job-linked
- unread states and notifications work

## Phase 5 — Invoicing + Stripe + deposits + payouts

### Deliver
- invoice composer
- send invoice
- attachments
- Stripe Connect onboarding
- deposit flow
- balance flow
- split payout setup
- webhook handlers

### Acceptance
- invoice -> payment state changes are webhook-driven
- deposit-paid -> balance-due semantics work
- split payout rules are visible and tested

## Phase 6 — Finance + Tax Centre

### Deliver
- real Finance overview
- invoice aging
- forecast
- payout view
- Tax Centre
- BAS-style exports
- reserve tracker
- readiness checklist

### Acceptance
- finance numbers come from authoritative invoice/payment data
- locale/currency are coherent
- GST logic is explicit and testable
- tax report outputs are generated

## Phase 7 — Hardening

### Deliver
- E2E suite
- accessibility pass
- performance pass
- error tracking
- deep-link verification
- release checklist

### Acceptance
- Playwright coverage for critical flows
- screenshots and walkthroughs attached
- final parity/improvement report written

---

## Universal acceptance rules

Every major slice must include:
- happy path
- loading state
- empty state
- validation state
- permission-denied state where relevant
- network / failure state
- mobile screenshot evidence
- typed tests

## Launch quality bar

Museio is ready for V1 launch only when:
- Portfolio feels premium and differentiated
- Finance is trustworthy and no longer approximate
- payments and deposits are robust
- booking cannot double-book across internal and external calendars
- Figma code has been normalized into maintainable architecture
- public links are secure and stable
