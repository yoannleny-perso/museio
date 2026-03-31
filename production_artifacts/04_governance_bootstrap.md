# 04 Governance Bootstrap

## Purpose

This artifact records the temporary governance bootstrap created because the original constitution and `.agents/` system were missing from the workspace.

## Trigger

The workspace originally lacked:

- `.specify/memory/constitution.md`
- `.agents/agents.md`
- `.agents/skills/`
- `.agents/workflows/`

The user approved using the current workspace as the temporary governance baseline.

## Controlling Sources Used

The bootstrap was derived from:

1. `MASTER_PROMPT.md`
2. `docs/03_portfolio_finance_truth.md`
3. `docs/05_data_states_and_integrations.md`
4. every other file in `docs/`

## Files Created

- `.specify/memory/constitution.md`
- `.agents/agents.md`
- `.agents/skills/README.md`
- `.agents/workflows/README.md`

## What The Bootstrap Locks In

- Expo / React Native for mobile
- Next.js for public web
- NestJS for orchestration
- Supabase for database/auth/storage/realtime
- Stripe Connect for payments
- shared TypeScript contracts and validation
- no thick-client business logic
- corrected Portfolio truth as binding
- corrected Finance truth as binding
- `figma_seed` as visual reference only

## Why This Matters

The earlier audit identified two governance blockers:

- the absence of the constitution
- the absence of the `.agents/` scaffold

This bootstrap resolves those blockers for planning and scaffolding work, while still leaving room for a future permanent governance pass.

## Limitations

- this is a temporary governance layer
- it was synthesized from existing docs, not recovered from original missing files
- it does not add new product scope
- it should not be treated as approval to start implementation automatically

## Recommended Next Use

Use the new governance files for:

- planning consistency
- contract-first work
- future artifact alignment
- implementation guardrails after approval

## Assumptions

- the current docs reflect the intended product and architecture direction well enough to bootstrap governance safely
- the missing original governance files may still be added later

## Risks

- a later permanent governance layer may require wording or precedence adjustments
- unresolved doc contradictions outside the enforced hierarchy could still surface during implementation

## Approval Gates

- Gate 1: approve the temporary constitution as the binding workspace baseline
- Gate 2: approve the temporary agent system scaffold
- Gate 3: approve whether a later permanent governance pass should replace or amend these files
