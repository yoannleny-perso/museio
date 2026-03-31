# Museio Workflows Baseline

## Purpose

This directory will hold reusable workflows for planning, implementation, QA, and release work in the Museio workspace.

At bootstrap time, the workflow system is intentionally minimal.

## Baseline Workflow Sequence

Until replaced by approved workflow files, agents should follow this sequence:

1. Read controlling governance files.
2. Audit the relevant source material.
3. Identify gaps, contradictions, anti-patterns, and missing contracts.
4. Write planning artifacts with assumptions, risks, and approval gates.
5. Wait for approval before implementation.
6. Implement only approved bounded vertical slices.
7. Produce verification artifacts after each major milestone.

## Workflow Constraints

- do not start with Figma-seed code migration
- do not skip contract and state-model definition for critical workflows
- do not invent new product scope unless explicitly labeled as a recommendation
- do not ship money or booking logic from client-only assumptions
- do not bypass approval gates documented in production artifacts

## Recommended Future Workflow Files

Recommended future additions:

- `audit_and_plan.md`
- `design_system_extraction.md`
- `contract_first_domain_modeling.md`
- `vertical_slice_delivery.md`
- `release_hardening.md`

These are recommendations only.
