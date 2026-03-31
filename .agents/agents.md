# Museio Agent System Draft

## Purpose

This file defines the temporary agent operating model for the current Museio workspace.

It exists because the original `.agents/` governance layer was not present in this checkout.

## Authority

Agents must follow this authority order:

1. `.specify/memory/constitution.md`
2. `docs/03_portfolio_finance_truth.md`
3. `docs/05_data_states_and_integrations.md`
4. every other file in `docs/`
5. `MASTER_PROMPT.md`

If there is a conflict:

- Portfolio and Finance decisions defer to `docs/03_portfolio_finance_truth.md`
- architecture and monorepo decisions defer to `docs/05_data_states_and_integrations.md`

## Agent Mandate

Agents working in this workspace must:

- treat the repo as a spec-first rebuild
- treat `app_build/figma_seed/` as a visual seed only
- avoid product implementation until the required planning/governance artifacts are approved
- preserve documented scope
- label recommendations clearly when they go beyond current documented scope

## Required Behaviors

### Planning behavior

- audit before implementing
- identify contradictions and missing contracts
- call out gaps rather than silently filling them with assumptions
- include assumptions, risks, and approval gates in planning artifacts

### Architecture behavior

- enforce Expo / React Native for mobile
- enforce Next.js for public web
- enforce NestJS for orchestration
- enforce Supabase as the data/auth/storage/realtime platform
- enforce Stripe Connect for payments
- enforce shared TypeScript contracts and validation
- reject thick-client business logic

### Domain behavior

- preserve the corrected Portfolio truth
- preserve the corrected Finance truth
- require explicit state models for booking, jobs, invoices, payments, payouts, publishing, calendar sync, and tax readiness

### Delivery behavior

- work in bounded vertical slices
- do not trust mock data or fake async flows as production behavior
- produce artifacts before and after major milestones
- prefer typed contracts over UI-inferred semantics

## Expected Agent Roles

### Architect / Planner

Responsible for:

- repo audits
- execution plans
- architecture decisions
- migration risk analysis

### Design-System Extractor

Responsible for:

- token inventory
- primitive extraction strategy
- operational vs public UI separation
- component rewrite vs keep decisions

### Domain Implementer

Responsible for:

- shared domain contracts
- state enums
- workflow definitions
- safe write paths

### Vertical Slice Implementer

Responsible for:

- implementing approved feature slices against shared contracts
- keeping mobile, web, and API aligned

## Current Agent Assets

The current scaffold includes:

- `.agents/agents.md`
- `.agents/skills/`
- `.agents/workflows/`

This is a bootstrap system only. It should be expanded after approval.

## Current Limitations

- no permanent rule files yet
- no custom skill definitions yet
- no reusable workflow documents beyond the initial bootstrap set

Agents must treat those gaps as operational constraints, not as permission to improvise architecture.
