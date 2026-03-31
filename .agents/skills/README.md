# Museio Skills Baseline

## Purpose

This directory will hold reusable task-specific skills for the Museio workspace.

At bootstrap time, no custom skills are yet approved beyond the documented project governance.

## Current Baseline Rules

Any future skill added here must remain consistent with:

- `.specify/memory/constitution.md`
- `docs/03_portfolio_finance_truth.md`
- `docs/05_data_states_and_integrations.md`
- the rest of `docs/`

## Expected Skill Categories

Recommended future skills:

- repo audit and gap analysis
- design-system extraction
- domain contract authoring
- Supabase schema and RLS planning
- NestJS module scaffolding
- Stripe Connect workflow integration
- portfolio CMS modeling
- finance and tax reporting validation

These are recommendations only. They are not yet approved implementations.

## Skill Authoring Rule

No skill may:

- override the constitution
- introduce thick-client money, tax, availability, or publish logic
- treat `figma_seed` as trusted architecture
- redefine Portfolio or Finance away from the corrected truth documents
