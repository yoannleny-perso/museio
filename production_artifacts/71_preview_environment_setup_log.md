# 71 Preview Environment Setup Log

## Scope

Phase 9 established a preview-ready verification path for the existing Museio platform without adding new feature domains.

## What Was Added

- preview environment variable examples in `app_build/museio_app/env.example`
- preview environment validator at `app_build/museio_app/scripts/diagnostics/validate-preview-env.mjs`
- preview Playwright config at `app_build/museio_app/playwright.preview.config.ts`
- preview creator smoke test at `app_build/museio_app/tests/e2e/creator-preview.spec.ts`
- preview workflow wiring in `app_build/museio_app/.github/workflows/ci.yml`

## Preview Environment Contract

The preview workflow now expects a GitHub Actions `preview` environment with these secrets:

- `PREVIEW_APP_URL`
- `PREVIEW_API_URL`
- `PREVIEW_SUPABASE_URL`
- `PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `PREVIEW_SUPABASE_SERVICE_ROLE_KEY`

## Runtime Startup Verification

Preview-style runtime startup paths were verified locally against an isolated browser-like stack:

- web at `http://127.0.0.1:3200`
- API at `http://127.0.0.1:4200/api`
- Supabase local stack at `http://127.0.0.1:54321`

`pnpm verify:preview-env` passed when pointed at that stack and confirmed:

- web root responded `200`
- `/auth/sign-in` responded `200`
- API `/health` responded `200`
- Supabase auth settings endpoint responded `200`

## Assumptions

- actual preview hosting for web and API will be provisioned outside this repo
- the preview environment will expose stable URLs for both web and API
- Supabase preview verification can use a dedicated preview project or an approved staging project

## Risks

- the repo can verify preview configuration and run preview smoke, but it does not itself create the hosting target
- local validation will fail if `SUPABASE_URL` points at hosted Supabase while preview probes point at a local stack; the validator intentionally flags that mismatch

## Approval Gate

Preview rollout can proceed once the `preview` GitHub environment secrets are populated and the preview job is run successfully against the deployed web/API pair.
