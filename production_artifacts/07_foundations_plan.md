# 07 Foundations Plan

## Scope

Phase 1 covers the production foundations only.

Included:

- monorepo scaffold in `app_build/museio_app/`
- `apps/mobile`, `apps/web`, `apps/api`
- `packages/ui`, `packages/types`, `packages/validation`, `packages/domain`
- pnpm workspace and Turbo repo wiring
- TypeScript baseline
- linting and formatting setup
- test skeletons
- environment validation
- Supabase client layers
- Expo, Next.js, and NestJS shells

Excluded:

- feature flows
- route-specific domain logic
- Portfolio implementation
- Booking implementation
- Jobs, CRM, Messages, Finance, Tax, and Stripe workflows

## Foundation Objectives

1. Establish the approved monorepo shape.
2. Centralize shared contracts and validation early.
3. Create app shells that can host future vertical slices.
4. Ensure environment handling and Supabase access patterns are explicit from day one.
5. Keep all business logic out of clients during foundation work.

## Deliverables

### Root

- workspace `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- ESLint config
- Prettier config
- shared `.gitignore`
- `env.example`
- root Vitest config

### Apps

- Expo shell in `apps/mobile`
- Next.js public shell in `apps/web`
- NestJS API shell in `apps/api`

### Shared packages

- token baseline in `packages/ui`
- transport contract baseline in `packages/types`
- Zod env validation in `packages/validation`
- canonical enum baseline in `packages/domain`

## Approval Assumptions

- Phase 1 may introduce shared domain enums as foundations, but not workflow implementation.
- Placeholder shell screens are acceptable so long as they do not become fake product flows.

## Risks

- no dependency install or runtime execution is guaranteed in this phase
- exact package versions may need adjustment during first install/build pass
- lint/test configs are scaffolded but not fully runtime-verified yet

## Completion Standard

Phase 1 is complete when:

- the monorepo shape exists
- all required apps and packages exist
- shared tooling is present
- app shells and Supabase/env layers are scaffolded
- no feature flow implementation has started
