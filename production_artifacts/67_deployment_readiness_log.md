# 67 Deployment Readiness Log

## Summary

Phase 8 improved deployment readiness through repeatable verification scripts, CI expansion, and explicit runtime diagnostics.

## Changes

- Updated `app_build/museio_app/package.json`
  - `verify:hosted-runtime`
  - `verify:launch`
  - `test:e2e`
  - `test:system-smoke`
- Updated `app_build/museio_app/.github/workflows/ci.yml`
  - added `build`
  - added `format:check`
- Added `app_build/museio_app/scripts/diagnostics/verify-hosted-runtime.mjs`
- Added `app_build/museio_app/scripts/e2e/system-smoke.mjs`

## Repeatable Verification Paths

Application/tooling verification:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Launch-oriented verification:

- `pnpm test:system-smoke`
- `pnpm test:e2e`
- `pnpm verify:hosted-runtime`

## What Passed

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:system-smoke`

## What Did Not Fully Pass

- `pnpm format:check`

Reason:

- the workspace already contains broad pre-existing Prettier drift across many files unrelated to the specific Phase 8 delta
- this is a hygiene issue, not a runtime blocker, but it should be cleaned before tightening CI to required-green on formatting

## Deployment Notes

- hosted runtime verification is reliable when the verifying process is launched without the local `SSL_CERT_FILE` override
- do not add TLS bypasses to app code
- preview/prod runners should be checked for inherited CA overrides before launch sign-off
- migration workflow itself was already normalized in Phase 2.5 and remains compatible with this phase

## Rollback Notes

Low-risk rollback points introduced in this phase:

- revert web auth redirect/sign-out UX changes
- revert API CORS enablement if origin policy needs tightening
- disable `test:e2e` / `test:system-smoke` scripts without affecting production runtime

Higher-risk rollback areas:

- none; this phase did not introduce a new product domain or change source-of-truth ownership

## Recommendation

- keep `build` in CI immediately
- keep `format:check` visible but non-blocking until repo-wide formatting debt is resolved
- keep `test:system-smoke` as a release-gate command even before it is promoted into CI
