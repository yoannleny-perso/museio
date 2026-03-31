# MUSEIO — MASTER PROMPT FOR GOOGLE ANTIGRAVITY

Use this file as the master execution contract for rebuilding Museio.

This is not a quick scaffold request. This is a production-grade rebuild of Museio as an artist operating system.

---

## 0. Your role

You are Google Antigravity acting as:
- principal product architect
- principal full-stack engineer
- mobile UX implementation lead
- platform engineer
- database and workflow designer
- payments and workflow specialist
- QA and release manager

You must preserve the real business value of Museio, fix legacy architecture debt, and build a production-ready system from the Figma code, the reverse-engineered findings, and this contract.

---

## 1. Mission

Build **Museio** as a mobile-first artist operating system with two connected experiences:

### 1.1 Internal artist app
Used by artists to:
- manage bookings
- manage clients and jobs
- control availability
- send quotes and invoices
- collect deposits and full payments
- manage finance and tax reporting
- sync calendars
- chat with clients
- manage a premium public portfolio

### 1.2 Public client-facing experience
Used by promoters, venues, brands, and clients to:
- discover and view artist portfolios
- understand the artist quickly
- browse media and social proof
- check availability
- submit booking requests
- review quotes
- pay deposits and invoices
- chat in a secure thread

---

## 2. Inputs you must use

Treat these as mandatory project inputs:

1. The Figma-generated code placed in `app_build/figma_seed/`
2. This file
3. All files in `docs/`
4. The constitution at `.specify/memory/constitution.md`
5. The project-context rule at `.agents/rules/project-context.md`

If the Figma-generated code conflicts with this document, preserve the good visual intent but follow **this document** for architecture, domain rules, security, state machines, and business logic.

---

## 3. Working mode

Work spec-first and phase-first.

Before changing large parts of the codebase:
1. Audit the Figma seed.
2. Inventory screens, components, routes, tokens, motion, data hooks, and bad patterns.
3. Compare the seed to the product contract in `docs/02_product_requirements.md`.
4. Write an execution plan.
5. Write migration risks.
6. Build in bounded vertical slices.
7. Produce artifacts after each major milestone: screenshots, walkthrough notes, test reports, and ADRs.

Do not do a blind rewrite.
Do not keep money logic in UI components.
Do not leave state semantics vague.
Do not preserve broken deep-link hacks, timer-based refresh hacks, or public-route shortcuts.

---

## 4. Output repository shape

Build the production app under `app_build/museio_app/` with this default shape unless an ADR justifies a deviation:

```text
app_build/museio_app/
  apps/
    web/
    mobile/
  packages/
    ui/
    design-tokens/
    domain/
    api-contracts/
    config/
    utils/
  services/
    workflows/
    webhooks/
  supabase/
    migrations/
    seed/
  docs/
    adr/
```

### Notes
- `apps/web` is the main Next.js application.
- `apps/mobile` contains the Capacitor wrapper and native shell config.
- `packages/ui` is the extracted design system.
- `packages/domain` holds shared types, enums, state-machine helpers, and validation.
- `services/` holds server-side workflow and webhook code.

---

## 5. Target tech stack

Use this stack unless a blocking issue requires an ADR.

### Frontend
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- Framer Motion
- TanStack Query
- Zustand for local UI state
- XState for critical workflows
- React Hook Form + Zod
- Recharts for finance and insights
- dnd-kit for reorderable portfolio sections

### Mobile
- Responsive web app first
- Capacitor 7 for iOS and Android shells
- FCM push notifications
- first-class deep-link and universal-link contract

### Data and backend
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Cloud Run TypeScript services for workflow logic, webhooks, background jobs, and signed public actions
- Cloud Tasks and Cloud Scheduler for deferred work

### Integrations
- Stripe Connect
- Resend
- Google OAuth + Google Calendar API
- Calendly API + webhooks
- Open Graph image generation for shareable Job Cards
- Sentry

---

## 6. Core architecture principles

These are non-negotiable.

1. The client is not the source of truth for money, tax, payment status, quote acceptance, or availability blocking.
2. Workflow rules must live in server-side logic and/or database-enforced rules.
3. Every important lifecycle must have a canonical state machine.
4. Every public route must be explicit, least-privilege, and signed where sensitive.
5. Every side effect must be intentional: email, push, calendar sync, payout events, reminders, chat notifications.
6. Every hardcoded magic number that affects product behavior must be lifted into configuration or versioned rules.
7. The design system must be extracted from the Figma code into typed reusable primitives.
8. Australia is the default business region, but the architecture must allow future international expansion.
9. Preserve the parts of the old app that matter; do not preserve dangerous deletion semantics, route drift, or brittle thick-client logic.
10. Portfolio and Finance requirements in `docs/03_portfolio_finance_truth.md` override earlier loose assumptions.

---

## 7. Product surfaces to build

### 7.1 Authenticated app shell
- Home
- Jobs
- Portfolio
- Finance
- More

### 7.2 Secondary authenticated destinations
- Availability
- Clients / CRM
- Messages
- Connected Calendars
- Settings
- Stripe payout setup
- Tax Centre
- Deposits & Payouts
- Theme Studio
- Portfolio Insights

### 7.3 Public surfaces
- Public portfolio at `/:handle`
- Public booking flow launched from portfolio and direct links
- Public quote view
- Public invoice / payment view
- Shareable Job Card view with Open Graph friendly design

### 7.4 Modal and sheet patterns
- booking modal
- add/edit job sheets
- add/edit client sheets
- invoice composer
- quote response modals
- theme picker
- palette selector
- add section flow
- media upload flows
- tax export flow
- split payment setup
- deposit setup
- chat composer attachments and action sheet

---

## 8. Canonical feature contract

Build these domains end to end.

### 8.1 Identity and onboarding
- auth, session, protected routes
- setup gating for required profile completion
- settings for profile, signature, payout details, invoice settings, tax settings

### 8.2 Portfolio system
Build the portfolio as a real CMS + public mini-site system.

Must support:
- authenticated edit mode at `/app/portfolio`
- public live mode at `/:handle`
- public/private state
- username prerequisite for publishing
- theme gradients and premium themes
- thumb-first editing
- section add, configure, reorder, toggle, duplicate where safe
- hero, short bio, full bio, photos, videos, releases, featured cards, events, testimonials, brand logos, FAQ, contact, Book Me CTA, custom link blocks
- live preview mode and public mode
- section-aware analytics
- share preview and publish flows

Critical corrections to preserve or consciously replace:
- current system uses `portfolio_settings` for page config and separate content tables for actual content
- current live page only shows public content and hides empty sections
- current Book Me section opens the booking flow in live mode
- current delete semantics for some section types are dangerous and must not be copied
- current startup state is too empty and must be replaced with guided starter templates
- current Featured Cards behavior is effectively single-card and should be rebuilt as a true multi-card block

### 8.3 Availability and scheduling
- internal weekly availability settings
- repeat rules
- vacation periods
- public availability lookup
- external calendar overlays from Google Calendar and Calendly
- internal jobs and booking requests block time
- conflict center and conflict resolution UI

### 8.4 Public booking
- inquiry / booking request entry
- multi-slot booking arrays for residencies and multi-day events
- validation and conflict checks
- slot summary and package summary
- quote generation path

### 8.5 Jobs and CRM
- request inbox
- quote / decline flows
- client records
- job detail and itemization
- statuses, timeline, attachments, notes
- chat tab on job detail
- shareable Job Card

### 8.6 Invoicing and money movement
- draft invoice creation
- send invoice
- deposit invoice path
- balance invoice path
- invoice attachments
- status updates from Stripe webhooks
- reminders and overdue handling
- split payments
- payout routing and fee visibility

### 8.7 Finance and Tax Centre
Build a real finance workspace, not a thin dashboard.

Must support:
- revenue overview
- forecast
- invoice/payment status
- deposit and balance visibility
- payouts and fees
- GST registration state
- GST calculations on line items
- BAS-style reporting exports
- tax reserve tracker
- ATO readiness checklist
- transaction classification and manual adjustments

Critical corrections from current app:
- current Finance page is only a 3-widget summary screen
- current earnings logic is approximate and uses job date as a proxy for invoice aging
- current forecast logic has range inconsistencies
- current Stripe dashboard button is generic, not account-specific
- current finance UI is visually clean but functionally shallow

### 8.8 Chat and notifications
- realtime client/artist chat
- push notifications
- unread indicators
- job-linked message threads
- attachment support where feasible
- timeline summaries and AI-generated recap hooks only if implemented safely and clearly marked

### 8.9 Sharing
- public portfolio links
- shareable Job Cards for WhatsApp and Instagram DM linking
- quote and invoice public views
- Open Graph image generation

---

## 9. Canonical state models

Use typed enums and explicit state diagrams.

### 9.1 Booking request
- `draft`
- `submitted`
- `under-review`
- `quote-sent`
- `quote-viewed`
- `quote-accepted`
- `quote-declined`
- `expired`
- `cancelled`

### 9.2 Job
- `draft`
- `upcoming`
- `in-progress`
- `past`
- `cancelled`
- `archived`

### 9.3 Invoice
- `draft`
- `sent`
- `viewed`
- `deposit-requested`
- `deposit-paid`
- `balance-due`
- `overdue`
- `paid`
- `void`

### 9.4 Payment
- `pending`
- `requires-action`
- `processing`
- `succeeded`
- `failed`
- `refunded`
- `partially-refunded`

### 9.5 Portfolio publish
- `private`
- `draft-live-preview`
- `public`
- `paused`

### 9.6 Calendar connection
- `not-connected`
- `connecting`
- `connected`
- `sync-error`
- `revoked`

### 9.7 Tax setup
- `not-registered`
- `registered-incomplete`
- `registered-ready`
- `report-warning`
- `report-ready`

---

## 10. Portfolio truth you must implement from latest repo findings

Read `docs/03_portfolio_finance_truth.md` fully. The summary is:

1. The portfolio has two real experiences: edit mode and live mode.
2. The editor is a narrow, thumb-friendly builder rather than a dashboard grid.
3. The live view is a public mini-site with empty-section hiding and booking integration.
4. Data is hybrid: `portfolio_settings` orchestrates the page, while photos, videos, releases, events, and cards live in separate tables.
5. Theme and gradient selection are already conceptually present and should evolve into a full Theme Studio.
6. Section navigation is dynamic and content-aware.
7. The Book Me section must feel native to the portfolio, not bolted on.
8. Dangerous section-deletion semantics from the old app must be replaced with safe scoped deletes.
9. New portfolios need guided templates and starter content, not a near-empty shell.

---

## 11. Finance truth you must implement from latest repo findings

Read `docs/03_portfolio_finance_truth.md` fully. The summary is:

1. The current Finance page is a thin summary, not a true finance system.
2. The current earnings widget is status-based and approximate.
3. Overdue aging must be rebuilt from real invoice timestamps and payment terms, not job date proxies.
4. Forecast logic must be rewritten with coherent period semantics.
5. Currency and locale handling must be Australia-first and configurable.
6. Stripe setup, dashboard access, deposits, split payouts, fees, and payout states must be product-native.
7. Tax Centre is a first-class Finance area, not a bolt-on card.

---

## 12. Figma code handling contract

### 12.1 What to preserve
- strong visual primitives
- worthwhile motion cues
- good layouts
- useful component shapes
- solid typography and spacing decisions

### 12.2 What to distrust
- ad hoc state logic
- mock routing
- fake data hooks
- one-off styles repeated everywhere
- inline magic numbers that drive business logic
- untyped forms and untyped server calls

### 12.3 Required Figma-seed outputs
Before production implementation, create:
- a token map
- a component map
- a gap list versus product requirements
- a migration plan from seed to production design system

---

## 13. Implementation phases

### Phase 0 — audit and plan
Write:
- repo audit
- execution plan
- migration risks
- design-system extraction plan

### Phase 1 — foundations
- monorepo setup
- design tokens
- shared UI package
- auth shell
- routing shell
- environment and integration scaffolding

### Phase 2 — portfolio system
- edit mode
- live mode
- theme studio
- content studio
- publishing and share flows
- analytics shell

### Phase 3 — availability and booking
- availability settings
- calendar sync
- conflict center
- public booking and multi-slot flow

### Phase 4 — jobs, CRM, chat
- inbox
- quote response
- job detail
- chat
- client records
- notifications

### Phase 5 — invoicing and payments
- invoice composer
- attachments
- Stripe Connect onboarding
- deposit workflows
- balance workflows
- split payouts
- webhook hardening

### Phase 6 — finance and tax
- finance dashboard
- tax centre
- BAS exports
- payout visibility
- reserve tracker

### Phase 7 — hardening and release
- e2e tests
- error tracking
- accessibility pass
- deep link pass
- artifact walkthroughs
- release checklist

---

## 14. Required deliverables

Antigravity must produce:
- production-ready code
- SQL migrations
- environment example file updates
- ADRs for major deviations
- architecture diagrams in markdown
- test suites
- test evidence in `production_artifacts/`
- screenshots and walkthrough notes for major flows
- a final feature parity and improvement checklist

---

## 15. Definition of done

The rebuild is not done until:
- the app shell works on mobile web and Capacitor
- all core flows are testable end to end
- Portfolio feels premium and thumb-friendly
- Finance is no longer a thin dashboard
- deposits, split payouts, and tax flows are represented correctly
- public routes are secure
- external calendar overlays prevent double-booking
- business logic is not trapped in UI code
- Figma-generated code has been normalized into a maintainable system
- Antigravity has produced verification artifacts after each phase

---

## 16. Final instruction

Build Museio as a product, not as a demo.
Preserve what users loved, repair what was brittle, and make the public portfolio and booking experience feel premium enough to stand beside the best creator tools in market while keeping the internal operating workflows trustworthy and fast.
