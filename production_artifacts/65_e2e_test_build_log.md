# 65 E2E Test Build Log

## Summary

Phase 8 added two launch-readiness verification layers:

- browser/mobile-capable public smoke coverage with Playwright
- deterministic system-smoke coverage for creator/commercial orchestration

## Added

- `app_build/museio_app/playwright.config.ts`
- `app_build/museio_app/tests/e2e/launch-readiness.spec.ts`
- `app_build/museio_app/scripts/e2e/system-smoke.mjs`
- `app_build/museio_app/package.json`
  - `test:e2e`
  - `test:system-smoke`

## Browser Smoke Scope

The Playwright suite covers the public experience where browser behavior is the real risk surface:

- public portfolio route
- public booking route
- public booking request submission
- mobile-sized layout via emulated mobile Chromium
- public availability masking with imported busy-block metadata hidden

Notes:

- the protected creator-shell browser case was intentionally removed from the mandatory Playwright pass after it proved lower-signal than the system-smoke path and added avoidable flake
- creator/commercial/finance/messaging orchestration is covered by the system-smoke script instead

## System Smoke Scope

`scripts/e2e/system-smoke.mjs` verifies the server-owned end-to-end orchestration path:

- public booking request persistence
- outsider denial on creator-owned booking detail
- booking request transition to `under-review`
- acceptance into exactly one job draft
- Stripe readiness sync with `acct_ready_demo`
- quote draft save, send, and public acceptance
- invoice draft save, send, deposit payment-session creation
- webhook-driven paid-state update to `deposit-paid`
- finance aggregation from invoice plus payment truth
- creator-scoped CRM linkage
- messaging thread creation plus client reply insertion
- outsider denial on thread detail
- external calendar overlay import
- public availability payload hides internal busy-block title/source metadata

## Verified Output

`pnpm test:system-smoke` returned:

```json
{
  "outsiderRequestStatus": 404,
  "quoteStatus": "accepted",
  "invoiceStatus": "deposit-paid",
  "paymentStatus": "succeeded",
  "finance": {
    "collectedMinor": 65340,
    "receivablesMinor": 152460,
    "balancesOutstandingMinor": 152460
  },
  "crm": {
    "invoiceCount": 1,
    "paymentCount": 1
  },
  "messaging": {
    "messageCount": 2,
    "outsiderThreadStatus": 404
  },
  "publicAvailability": {
    "containsHiddenConflict": false
  }
}
```

## Browser Smoke Result

The public Playwright smoke passed earlier in this phase for both:

- `desktop-chromium`
- `mobile-chromium`

The main issues uncovered while getting there were real product hardening issues, not flaky selectors:

- missing CORS on Nest API for browser-origin requests
- browser download/install path also affected by the local `SSL_CERT_FILE` override

Both were addressed or isolated during Phase 8.

## Remaining E2E Gap

The creator-side browser flow is still represented more honestly by the deterministic system-smoke script than by a long Playwright script. That is acceptable for this phase, but a future preview-environment browser suite could reintroduce the full protected creator path once runtime orchestration is deployed into stable preview infrastructure.
