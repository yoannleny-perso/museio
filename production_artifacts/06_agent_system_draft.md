# 06 Agent System Draft

## Summary

The drafted agent system gives the workspace a minimal but enforceable `.agents/` baseline until a fuller agent framework is added.

## Files Added

- `.agents/agents.md`
- `.agents/skills/README.md`
- `.agents/workflows/README.md`

## What The Agent System Enforces

### Authority Order

Agents must defer to:

1. `.specify/memory/constitution.md`
2. `docs/03_portfolio_finance_truth.md`
3. `docs/05_data_states_and_integrations.md`
4. every other file in `docs/`
5. `MASTER_PROMPT.md`

### Required Behaviors

- spec-first work
- audit before implementation
- explicit gap identification
- assumptions, risks, and approval gates in planning
- rejection of thick-client workflow logic
- adherence to Expo/Next/Nest/Supabase/Stripe architecture

### Domain Protection

- Portfolio correction is binding
- Finance correction is binding
- typed workflow states are required
- seed visuals may inform design, not business architecture

## Skills Baseline

The `skills` scaffold currently does not define operational skills beyond governance compatibility rules.

It does:

- reserve the directory for future approved skills
- define acceptable skill categories
- prohibit skills from overriding the constitution or corrected truth files

## Workflow Baseline

The `workflows` scaffold currently defines a minimal operating sequence:

1. read governance
2. audit
3. identify gaps
4. write artifacts
5. await approval
6. implement approved slices only
7. produce verification artifacts

## Draft Quality Assessment

This is intentionally lightweight, but it is sufficient to:

- remove the earlier `.agents/` blocker
- standardize how future planning and implementation should proceed
- keep agent work aligned with the current documented architecture

## Recommendations

Recommended future additions after approval:

- dedicated workflow files for audit, design extraction, contract modeling, vertical slice delivery, and release hardening
- project-context and rules files if the team wants more granular agent guidance
- specialized skills for Supabase, NestJS, portfolio modeling, and finance/tax validation

These are recommendations only.

## Assumptions

- the immediate need is a governance-safe baseline, not a full multi-agent operating platform
- a minimal scaffold is better than inventing a large workflow system without approval

## Risks

- without future expansion, the agent system may remain too high-level for large-scale implementation coordination
- later permanent agent files may supersede structure or terminology used here

## Approval Gates

- Gate 1: approve the temporary agent authority order
- Gate 2: approve the current skills/workflows scaffold as sufficient for pre-implementation governance
- Gate 3: approve whether a second pass should add more granular workflow and role files before coding begins
