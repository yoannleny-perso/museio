# 77 Preview QA Execution Report

## Scope

Phase 9 QA execution was requested against a real deployed preview environment.

## Executive Result

The product-level QA signal is strong, but the real deployed preview execution is currently blocked by missing preview deployment configuration in this workspace.

## Deployed Preview Status

Status: `blocked`

Reason:

- no `PREVIEW_APP_URL` or `PREVIEW_API_URL` values were available in the local environment
- the repo contains a manual `preview-smoke` GitHub workflow, but no deployed preview URLs or accessible preview secrets were available from this workspace
- no separate deployment workflow or checked-in preview hosting configuration was present in `.github/workflows/`

Because of that, Tasks A and B could not be executed against a real deployed preview target honestly.

## What Was Executed

### 1. Hosted runtime verification

Command:

- `pnpm verify:hosted-runtime`

Result:

- passed as an environment diagnostic
- inherited `SSL_CERT_FILE` still fails with `SELF_SIGNED_CERT_IN_CHAIN`
- isolated fresh-process probe succeeds to hosted Supabase transport and returns expected HTTP `401`

Classification:

- local environment issue
- not a product-code blocker

### 2. Release gate checks

Command:

- `pnpm verify:release`

Result:

- passed

Verified components:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:system-smoke`

System smoke output confirmed:

- accepted booking to job conversion
- quote acceptance
- invoice `deposit-paid` state
- payment `succeeded`
- finance reconciliation updates
- CRM linkage
- messaging visibility isolation
- public availability masking

### 3. Preview-like local validation

Since no deployed preview URLs were available, I ran the exact preview validation path against a local preview-like stack:

- web: `http://127.0.0.1:3200`
- API: `http://127.0.0.1:4200/api`
- Supabase: `http://127.0.0.1:54321`

Commands:

- `pnpm verify:preview-env`
- `pnpm test:preview-smoke`
- Playwright public smoke from `launch-readiness.spec.ts`

Results:

- preview environment validator passed
- protected creator preview smoke passed
- public portfolio/booking smoke passed

## QA Checklist Status

### Real deployed preview

- public portfolio: `blocked`
- public booking: `blocked`
- creator booking ops: `blocked`
- quotes/invoices/payments: `blocked`
- finance: `blocked`
- messaging: `blocked`
- calendar overlays: `blocked`

Reason:

- no real deployed preview URL was available to test

### Preview-like local deployment

- public portfolio: `pass`
- public booking: `pass`
- creator booking ops: `pass`
- quotes/invoices/payments: `pass`
- finance: `pass`
- messaging: `pass`
- calendar overlays: `pass`

Evidence basis:

- public browser smoke
- preview creator browser smoke
- release-gate system smoke

## Key Separation

True setup blocker:

- missing real preview deployment target and preview secrets access

No new product blocker was discovered in this execution pass.

## Recommendation

Do not call preview QA complete yet. Treat this report as:

- `pass` for release-gate and preview-path readiness
- `blocked` for real human preview execution until preview URLs are provisioned and accessible
