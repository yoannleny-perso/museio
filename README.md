# Museio — Antigravity Workspace Kit

This folder is the starter kit for rebuilding **Museio** in Google Antigravity.

It is designed so Antigravity starts from a clean, spec-first foundation instead of trying to improvise from scattered prompts.

## What this kit contains

- `MASTER_PROMPT.md` — the master execution contract
- `docs/` — domain context, requirements, architecture, corrected Portfolio/Finance truth, Figma handoff, and acceptance criteria
- `.agents/` — Antigravity personas, rules, reusable skills, and suggested workflows
- `.specify/memory/constitution.md` — the non-negotiable project constitution for spec-driven planning
- `app_build/figma_seed/` — where you should place the Figma-generated code
- `app_build/museio_app/` — where Antigravity should build the real production app
- `production_artifacts/` — where Antigravity should write audits, plans, ADRs, screenshots, walkthroughs, and test evidence
- `.env.example` — required environment variables and integration placeholders

## Human operator checklist

1. Create a new local Antigravity workspace.
2. Copy this entire folder into the workspace root.
3. Place the Figma-generated code into `app_build/figma_seed/`.
4. If you also want to give Antigravity the old codebase, place it under `app_build/legacy_reference/`.
5. Open the workspace in Antigravity.
6. In the first Antigravity conversation, ask it to read these files in order:
   - `README.md`
   - `MASTER_PROMPT.md`
   - `.specify/memory/constitution.md`
   - `.agents/rules/project-context.md`
   - `docs/01_project_context.md`
   - `docs/02_product_requirements.md`
   - `docs/03_portfolio_finance_truth.md`
   - `docs/04_architecture_and_stack.md`
   - `docs/05_data_states_and_integrations.md`
   - `docs/06_execution_plan_and_acceptance.md`
   - `docs/07_figma_handoff.md`
7. Ask Antigravity to audit `app_build/figma_seed/` and write the following before coding:
   - `production_artifacts/00_repo_audit.md`
   - `production_artifacts/01_execution_plan.md`
   - `production_artifacts/02_design_system_extraction_plan.md`
   - `production_artifacts/03_migration_risks.md`
8. Only after those artifacts exist, tell Antigravity to implement bounded vertical slices into `app_build/museio_app/`.

## First prompt to give Antigravity

```md
Read README.md, MASTER_PROMPT.md, the constitution, the project-context rule, and every file in docs/. Then audit app_build/figma_seed/ and write: 00_repo_audit.md, 01_execution_plan.md, 02_design_system_extraction_plan.md, and 03_migration_risks.md into production_artifacts/. Do not start coding until those artifacts are complete. Treat figma_seed as a visual and interaction seed, not as a trusted architecture. Build the real code inside app_build/museio_app/.
```

## Working rule

Antigravity should treat the Figma code as:
- **authoritative for visual intent when high quality**
- **non-authoritative for architecture, data flow, security, routing, business rules, and state machines**

## Build order

1. Foundation and repo shape
2. Design-system extraction
3. Auth and app shell
4. Portfolio system
5. Availability + public booking
6. Jobs + CRM + quoting
7. Invoicing + Stripe Connect + deposits + split payouts
8. Finance + Tax Centre
9. Chat + notifications
10. Calendar sync + external availability overlays
11. QA, hardening, release prep

## Important correction from latest analysis

The earlier reverse-engineering under-described **Portfolio** and **Finance**.
The corrected truth lives in `docs/03_portfolio_finance_truth.md`, and that file overrides earlier looser assumptions.
# museio
