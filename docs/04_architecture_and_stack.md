# 04 — Architecture and Stack

## Target architecture

### Client layer
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- TanStack Query
- Zustand
- XState
- RHF + Zod

### Mobile delivery
- responsive app first
- Capacitor 7 wrapper for iOS and Android
- universal links and deep-link contract

### Data and workflow layer
- Supabase Auth + Postgres + Storage + Realtime
- Cloud Run services for server-side workflows and integrations
- Cloud Tasks / Scheduler for retries and scheduled jobs

## Why this shape

This preserves migration speed and domain continuity from the old Supabase-heavy app while moving critical money, scheduling, and messaging rules out of a brittle thick client.

## Monorepo recommendation

```text
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
```

## Boundary rules

### Frontend responsibilities
- rendering
- local view state
- form state
- optimistic UX where safe
- invoking typed APIs
- displaying explicit workflow states

### Backend responsibilities
- workflow orchestration
- signed public actions
- payment link creation
- email/push side effects
- calendar sync
- invoice aging
- finance aggregations
- tax report aggregation
- split payout calculations

### Database responsibilities
- tenancy
- constraints
- audit-friendly persistence
- row-level security
- materialized views or helper views where useful

## Routing model

### Private routes
- `/app/*`

### Public routes
- `/:handle`
- `/:handle/book`
- `/q/:token`
- `/invoice/:token`
- `/job-card/:token`

Tokens and signed links must be explicit and revocable.

## State machine recommendation

Use explicit state charts for:
- booking request lifecycle
- quote response lifecycle
- invoice and deposit lifecycle
- Stripe onboarding and payouts
- portfolio publishing
- calendar sync
- chat delivery and read states
- tax report readiness

## Design-system extraction rule

The first frontend phase must:
- extract tokens from Figma seed
- normalize component API names
- convert repeated ad hoc styling into shared primitives
- split operational components from portfolio/public components

## Non-negotiable technical debt avoidance

Do not carry forward:
- business rules buried in UI components
- generic stringly typed statuses across unrelated domains
- `setTimeout` routing or refresh hacks
- environment-leaking public URLs
- destructive section-delete shortcuts
- approximate finance aging based on unrelated dates
