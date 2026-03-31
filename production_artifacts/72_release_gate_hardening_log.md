# 72 Release Gate Hardening Log

## Goal

Turn the existing verification set into a real release gate instead of a loose checklist.

## Changes

- added `pnpm verify:release`
- changed `pnpm verify:launch` to alias the real release gate
- promoted `pnpm test:system-smoke` into an orchestrated command that starts Supabase, resets schema, boots app runtimes, runs the full smoke, and cleans up
- added Supabase CLI setup and `pnpm test:system-smoke` to CI
- split formatting into a non-blocking `format-hygiene` CI job
- added a manual `workflow_dispatch` preview-smoke CI job

## Required Release Checks

These are now the hard release gates:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:system-smoke`

## Non-Blocking Hygiene Check

`pnpm format:check` remains visible but is not a release blocker yet because the repo still has broad pre-existing formatting drift.

## Verification

Passed:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:system-smoke`

Still failing by design as hygiene debt:

- `pnpm format:check`

## Notes

The release smoke now chooses isolated ports dynamically and falls back to `npx supabase@latest` if the Supabase CLI is not already on `PATH`, which makes the command more portable across local and CI runners.

## Approval Gate

Treat a branch as preview-ready only if all five hard release checks pass. Formatting cleanup stays tracked, but does not block preview rollout in Phase 9.
