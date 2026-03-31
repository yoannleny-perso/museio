# Museio Production Monorepo

This directory contains the Phase 1 production foundations for Museio.

## Scope

Phase 1 includes:

- monorepo structure
- shared tooling
- shared TypeScript contracts
- environment validation
- Supabase client layers
- Expo mobile shell
- Next.js public web shell
- NestJS API shell

## Out Of Scope

Phase 1 does not include:

- Portfolio flows
- Booking flows
- Jobs, CRM, chat, finance, or tax features
- Stripe workflow implementation
- product-specific business logic

## Workspace Layout

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
```

## Suggested Next Command

Once dependencies are installed, the expected workflow is:

```bash
pnpm install
pnpm dev
```
