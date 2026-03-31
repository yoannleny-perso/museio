# 05 — Data, State, Integrations, and Architecture Decisions

## Purpose

This document replaces the previous `05_data_states_and_integrations.md` and defines the recommended technical foundation for the new Museio platform.

It is intentionally opinionated. Antigravity should treat this as the default architecture unless a later architecture decision record (ADR) explicitly overrides a section.

Museio is not only a mobile app. It is a multi-surface product with:

- a mobile creator operating system for artists
- a public web portfolio and booking surface
- payment, invoicing, deposit, and payout workflows
- realtime booking inbox, messaging, and finance updates
- shareable links for jobs, quotes, invoices, and public portfolio content

Because of that, the platform must be designed as a **mobile-first but web-critical system**.

---

## Executive Decision

Build Museio as a **TypeScript monorepo** with:

- **Expo / React Native** for the native app
- **Next.js** for public web and shareable client-facing views
- **NestJS** for domain orchestration and backend API modules
- **Supabase** for Postgres, Auth, Storage, Realtime, and selected edge/background functions
- **Stripe Connect** for payments, deposits, split payouts, connected accounts, and payment links

### Architecture shape

Use a **hybrid modular monolith**:

- one primary Postgres database
- one primary backend application with modular domain boundaries
- one native app
- one public/client web app
- shared packages for UI tokens, domain contracts, validation, and config

Do **not** use microservices for V1.

Do **not** rebuild Museio as a Supabase-thick client.

---

## Why this is the right foundation

### Why not mobile only?

Museio needs first-class public web surfaces for:

- public artist portfolio pages
- public booking pages
- quote acceptance pages
- invoice payment pages
- public job cards and social-share unfurls
- link-open flows from WhatsApp, Instagram, email, and SMS

A mobile-only architecture would force too much public experience into weak or awkward surfaces.

### Why not pure Supabase again?

The legacy Museio codebase pushed too much business logic into the client and scattered edge functions. That created logic drift, duplication, and hidden behavior.

The new version must separate responsibilities cleanly:

- **Postgres owns truth and hard invariants**
- **NestJS owns orchestration and business workflows**
- **clients own presentation and local interaction state**
- **Edge Functions own webhook and background edge execution where appropriate**

### Why not microservices?

Museio has meaningful domain complexity, but it is still a single cohesive product. Microservices would create unnecessary deployment, observability, contract, and coordination overhead for V1.

A modular monolith gives:

- strong boundaries
- lower complexity
- faster Antigravity output
- simpler debugging
- cleaner migrations

---

## Recommended Stack

## 1. Monorepo and tooling

### Required

- **pnpm** for package management
- **Turborepo** for task orchestration and caching
- **TypeScript** everywhere
- **shared ESLint + Prettier config**
- **shared tsconfig base**
- **Changesets** or equivalent release/versioning discipline for shared packages

### Workspace shape

```text
apps/
  mobile/           # Expo / React Native app
  web/              # Next.js public + client-facing web app
  api/              # NestJS backend
packages/
  ui/               # shared design tokens and primitives
  domain/           # domain types, events, status enums, mappers
  validation/       # zod schemas and form contracts
  config/           # env helpers, constants, feature flags
  analytics/        # analytics event contracts
infra/
  supabase/         # migrations, seeds, policies, functions
  docs/
production_artifacts/
```

---

## 2. Frontend

## 2.1 Mobile app

### Required stack

- **React Native**
- **Expo**
- **Expo Router**
- **TypeScript**
- **TanStack Query**
- **Zustand** for lightweight client state
- **React Hook Form**
- **Zod**
- **React Native Reanimated**
- **React Native Gesture Handler**
- **FlashList** for performance-sensitive lists

### Why

This keeps the team in the React ecosystem while delivering native UX quality for:

- calendar interactions
- gestures
- upload workflows
- chat
- notifications
- complex form editing
- thumb-first portfolio editing

### Mobile responsibilities

The mobile app should own:

- authenticated creator workspace
- jobs and CRM workflows
- finance workspace
- invoice creation and send flows
- chat and notifications
- portfolio editing
- connected calendar management
- payouts, tax center, and settings

It should **not** be the only home for public portfolio and client booking.

---

## 2.2 Public and client web app

### Required stack

- **Next.js App Router**
- **TypeScript**
- shared tokens and contracts from the monorepo

### Why

This is required for:

- public artist portfolio pages
- public booking experience
- quote accept / decline views
- invoice payment and receipt views
- job-card public links
- dynamic Open Graph previews
- robust deep linking from social and email

### Web responsibilities

The web app should own:

- public portfolio live mode
- booking funnel
- quote / invoice / payment link web views
- attachment download views
- social-share link rendering
- metadata / OG image generation
- lightweight client portal views where needed

---

## 3. Backend and domain orchestration

## 3.1 Primary backend

### Required stack

- **NestJS**
- **TypeScript**
- **OpenAPI / Swagger generation**
- background job support via queue or task orchestration where necessary

### Why

NestJS is the orchestration and application layer. It should coordinate domain rules, integrations, and stable APIs instead of scattering critical logic across the mobile app or ad hoc functions.

### NestJS responsibilities

NestJS should own:

- domain services
- application services / orchestrators
- command handling
- integration services
- policy checks beyond simple row-level ownership
- anti-corruption layer around Supabase / Stripe / Google / Calendly
- public API composition for mobile and web clients

### NestJS modules

Create modules for:

- Identity and Access
- Profiles
- Portfolio
- Availability
- Booking Requests
- Clients / CRM
- Jobs
- Quotes
- Invoices
- Payments
- Tax and Reporting
- Messaging
- Notifications
- Analytics
- File Attachments
- Calendar Sync
- Admin / Support

---

## 3.2 Data platform

### Required stack

- **Supabase Postgres**
- **Supabase Auth**
- **Supabase Storage**
- **Supabase Realtime**
- **Supabase Edge Functions** for selected cases only

### Why

Supabase remains an excellent fit for Museio because the product needs:

- relational integrity
- row-level security
- realtime updates
- secure file storage
- fast iteration on auth and storage primitives

### Supabase responsibilities

Supabase should own:

- relational persistence
- row-level data protection
- file storage buckets
- realtime subscriptions for selected events
- auth users and identity primitives
- controlled edge/webhook execution where appropriate

### Strict rule

Supabase is a **platform layer**, not the full application architecture.

Do not put business-critical workflow logic exclusively in client code.
Do not let edge functions become a second, messy backend.

---

## 4. Payments and money movement

### Required stack

- **Stripe Connect**
- Stripe payment links or hosted payment pages where appropriate
- account login / account session flows for connected accounts

### Why

Museio needs:

- invoice payment collection
n- deposits
- split payouts
- platform fees
- connected account onboarding
- future marketplace-style money movement

Stripe Connect is the right foundation for this.

### Stripe responsibilities

Stripe should own:

- payment authorization and collection
- connected account onboarding
- payment links / hosted payment surface
- payout mechanics
- transfer mechanics
- webhook event delivery

### Stripe should not own

Stripe should **not** be the source of truth for Museio business state.

Museio must persist its own state transitions for:

- booking requests
- jobs
- quotes
- invoices
- deposit status
- balance due status
- payout state
- tax reporting state

Museio may react to Stripe events, but Stripe must not be treated as the app database.

---

## Architecture Principles

## Principle 1 — Postgres owns truth

Hard invariants and durable state must live in the database model and server-side write paths.

Examples:

- one booking request belongs to one artist
- one deposit belongs to one invoice or one payment plan
- one invoice has an immutable issue timestamp
- no public booking should create conflicting accepted slots
- public portfolios only render if published and accessible

## Principle 2 — Typed contracts everywhere

All app-to-backend contracts should be expressed in shared TypeScript and Zod schemas.

This includes:

- DTOs
- form payloads
- public API responses
- job and invoice state enums
- event payloads
- integration adapters

## Principle 3 — Thin clients, rich UX

Clients should be rich in interaction, animation, and presentation, but thin in business authority.

No critical state machine should live only in the client.

## Principle 4 — Domain boundaries over feature sprawl

Organize by domain, not by screen.

Bad:
- home module
- settings module
- finance page module

Good:
- invoices
- tax
- bookings
- portfolio
- messaging

## Principle 5 — Public web is a first-class citizen

Every public portfolio, booking, quote, invoice, and job-card flow must be designed intentionally for web delivery.

## Principle 6 — Event-driven where useful, not everywhere

Use domain events for side effects, notifications, analytics, and async workflows. Do not create unnecessary distributed complexity.

---

## State Management Strategy

## Client-side state

### Use TanStack Query for:

- server data fetching
- cache invalidation
- optimistic updates where safe
- background refreshes
- mutation state

### Use Zustand for:

- ephemeral UI state
- modal / sheet state
- draft editing state
- local editor state
- filters and view preferences

### Do not use global client state for:

- source-of-truth booking status
- source-of-truth invoice/payment status
- source-of-truth tax reporting state
- source-of-truth availability logic

## Server-side state

The server owns:

- identity and role claims
- canonical portfolio structure and publish state
- availability truth
- booking lifecycle
- job lifecycle
- quote lifecycle
- invoice lifecycle
- payment lifecycle
- payout lifecycle
- tax lifecycle
- chat delivery records and permissions

---

## Canonical Domain Model Areas

Define bounded contexts for:

### Identity and Access
- users
- roles
- profile completion
- connected auth providers
- permissions

### Portfolio
- portfolio settings
- section definitions
- section ordering
- publication state
- theme tokens
- public handle
- asset references
- public analytics

### Availability
- internal working hours
- blackout rules
- external calendar overlays
- residency / recurring slot rules
- booking conflict checks

### Booking Requests
- request metadata
- requested slots
- multi-slot requests
- request status
- artist response state
- quote conversion hooks

### CRM / Clients
- clients
- contact methods
- notes
- tags
- lead source
- booking history
- communication records

### Jobs
- booked work
- packages
- line items
- event logistics
- attachments
- status transitions

### Quotes and Invoices
- quote drafts
- invoice drafts
- invoice numbering
- line items
- tax configuration
- attachments
- due dates
- send records

### Payments
- deposits
- balances
- payment intents / links
- webhook records
- payout allocation
- split payments
- payment failures / retries

### Finance and Tax
- earnings summaries
- forecast summaries
- GST collected / payable
- GST export periods
- ATO / BAS reporting artifacts
- reconciliation markers

### Messaging
- conversation threads
- participants
- messages
- attachments
- read state
- delivery events
- system messages

### Notifications
- in-app notifications
- push notifications
- email notifications
- reminder rules

---

## Portfolio-specific architectural requirements

The previous app under-modeled Portfolio. The new system must treat it as a major product area.

### Required Portfolio architecture

Portfolio must support **two distinct experiences**:

1. **Edit Mode**
   - authenticated
   - creator-facing
   - thumb-first editor
   - inline edits and reorder flows
   - theme controls
   - publish controls

2. **Live Mode**
   - public-facing
   - no creator chrome
   - optimized for conversion, scrolling, media, and booking
   - can open booking flow directly

### Portfolio implementation rules

- section instances must be durable and independently addressable
- deleting one section must never delete all content of that type for the user
- section ordering must be explicit and stable
- multiple custom instances of the same section type must be supported safely
- live mode should hide empty sections automatically
- edit mode should support placeholders, previews, and thumb-reachable controls
- social links, music, media, shows, and booking CTA must be configurable

### Portfolio public web rules

- public routes must be first-class in Next.js
- handles must be unique and validated
- public/private state must be server-enforced
- OG metadata and preview images must be generated server-side

---

## Finance-specific architectural requirements

The previous app under-built Finance. The new version must be a real financial workspace, not a thin dashboard.

### Finance must support

- earnings overview
- forecast overview
- invoice list and detail
- payment timeline
- deposit tracking
- balance-due tracking
- payout visibility
- tax center
- GST calculations and reporting support
- exportable summaries
- reconciliation markers

### Finance implementation rules

- finance widgets must derive from canonical invoice and payment records, not weak UI approximations
- overdue logic must rely on invoice send date plus due terms, not event date proxies
- all monetary amounts must be locale- and currency-aware
- Australia-first currency and GST requirements must be supported cleanly
- stripe webhook results must update internal finance state through durable server workflows

---

## Integration Strategy

## Google Calendar and Gmail

Use Google integrations for:

- external calendar sync
- conflict checking
- availability overlays
- optional invitation and communication workflows

### Rule

External calendar data is an overlay for scheduling truth. It should block slots, but not replace Museio domain entities.

## Calendly

If supported, Calendly should be treated as an external source of blocked time or captured leads, not the primary booking system.

Museio must remain the source of truth for:

- public booking flow
- booking records
- quote generation
- job creation

## WhatsApp and Instagram share flows

Support deep links and share-sheet integrations for:

- public job cards
- quotes
- invoices
- portfolios

Social sharing should point to Museio-controlled web routes with proper OG metadata.

---

## Realtime Strategy

Use Supabase Realtime selectively for:

- booking inbox updates
- chat message delivery / presence indicators
- portfolio publish-state updates where useful
- finance refresh events after payment updates
- notification counts

Do not use realtime as a replacement for durable state transitions.

---

## Security and Authorization

### Required controls

- RLS on all tenant-facing tables
- explicit server-side authorization checks on all sensitive mutations
- signed public action tokens for client-facing actions when needed
- expiring tokens for quote acceptance, invoice payment actions, and sensitive public actions
- storage bucket access policies by domain
- audit logs for finance and payment mutations

### Never repeat from legacy system

- do not expose environment leakage in client code
- do not hardcode preview domains in production logic
- do not rely on client-only permission checks
- do not let generic Stripe dashboard links stand in for proper connected-account access

---

## Environment Strategy

Maintain separate environments for:

- local
- staging
- production

### Each environment must have

- separate Supabase project
- separate Stripe configuration
- separate storage buckets or isolated bucket policies
- separate app URLs and public web URLs
- separate webhook secrets

---

## Suggested initial status model

### Booking Request
- draft
- submitted
- under-review
- quoted
- declined
- expired
- accepted
- converted

### Job
- draft
- requested
- upcoming
- completed
- cancelled
- archived

### Invoice
- draft
- issued
- sent
- viewed
- partially-paid
- deposit-paid
- paid
- overdue
- void
- refunded

### Payment Plan
- none
- deposit-only
- deposit-and-balance
- installments

### Payout
- pending
- in-transit
- paid-out
- failed
- reversed

These enums must be finalized centrally in shared domain packages and used consistently across every client and server surface.

---

## Suggested build order

1. Monorepo + tooling foundation
2. Shared domain contracts and validation
3. Supabase schema and RLS baseline
4. NestJS skeleton and module boundaries
5. Auth and profile core
6. Portfolio edit + live system
7. Booking and availability engine
8. CRM and jobs
9. Quotes and invoices
10. Stripe Connect payments, deposits, and split payouts
11. Finance workspace and tax center
12. Messaging and notifications
13. Hardening, observability, performance, and QA

---

## Non-negotiable product quality requirements

- mobile interactions must feel native and performant
- public portfolio pages must feel premium and cinematic
- public booking must be fast, trustworthy, and conflict-safe
- finance numbers must come from durable canonical records
- app state transitions must be explainable and auditable
- every critical workflow must have loading, empty, error, and permission states
- architecture must stay readable to Antigravity and to human engineers

---

## Final recommendation

The best foundation for Museio is:

- **Expo / React Native** for native creator workflows
- **Next.js** for public and client-facing web surfaces
- **NestJS** for domain orchestration
- **Supabase** for data, auth, storage, realtime, and selected edge execution
- **Stripe Connect** for money movement
- **pnpm + Turborepo** for a typed monorepo

This combination gives Museio:

- native-quality mobile UX
- premium public web experiences
- durable financial and booking logic
- strong realtime support
- a clean structure for Antigravity to reason about and implement

