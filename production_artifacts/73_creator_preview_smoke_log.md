# 73 Creator Preview Smoke Log

## Scope

Phase 9 added a stronger browser-like smoke for protected creator flows without relying on the older brittle long local browser path.

## What Was Added

- `app_build/museio_app/playwright.preview.config.ts`
- `app_build/museio_app/tests/e2e/creator-preview.spec.ts`
- `pnpm test:preview-smoke`

## Covered Flow

The preview creator smoke now covers:

- auth entry and protected redirect to sign-in
- sign-in with a seeded creator account
- booking inbox visibility
- accepted booking to job visibility
- quote and invoice draft visibility on the job detail screen
- finance workspace visibility
- messaging thread visibility

## Hardening Found During This Work

The new smoke exposed two real issues and both were fixed:

- the preview seed was overwriting the portfolio editor payload too aggressively instead of preserving the server-owned settings envelope
- API CORS handling was too tied to old localhost assumptions and did not allow a preview-style web origin

## Verification Performed

`pnpm test:preview-smoke` passed against a local preview-like stack:

- web at `http://127.0.0.1:3200`
- API at `http://127.0.0.1:4200/api`
- Supabase local stack at `http://127.0.0.1:54321`

## Remaining Risk

This smoke is preview-ready, but a real hosted preview run still depends on deployed preview URLs and GitHub preview secrets being configured.

## Approval Gate

Before opening preview testing to non-developers, run the preview smoke against the actual deployed preview environment and require it to pass.
