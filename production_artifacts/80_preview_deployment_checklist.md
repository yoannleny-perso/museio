# 80 Preview Deployment Checklist

## GitHub

- confirm the latest branch is pushed to GitHub
- confirm Vercel and Railway both point at the same repository branch for preview
- confirm the GitHub `preview` environment exists if you plan to run preview smoke from Actions

## Railway API

- create/import the service from GitHub
- set root directory to `app_build/museio_app`
- confirm Railway detected `railway.json`
- confirm Railway build completes
- confirm Railway start command succeeds
- confirm `/api/health` returns `200`
- confirm Railway env vars match `docs/railway_env_template.md`

## Vercel Web

- import the repo into Vercel
- set root directory to `app_build/museio_app/apps/web`
- confirm Vercel detected `apps/web/vercel.json`
- confirm the web build succeeds
- confirm landing page loads
- confirm `/auth/sign-in` loads
- confirm Vercel env vars match `docs/vercel_env_template.md`

## Cross-Service Wiring

- confirm Vercel `NEXT_PUBLIC_API_URL` points to the Railway API URL with `/api`
- confirm Railway `NEXT_PUBLIC_APP_URL` points to the Vercel preview URL
- confirm Railway `CORS_ALLOWED_ORIGINS` includes the Vercel preview URL
- confirm both web and API point to the same Supabase project

## Preview Verification

- run `pnpm verify:preview-env` against the real preview URLs
- run `pnpm test:preview-smoke` against the real preview URLs
- run the manual checklist in `production_artifacts/75_preview_test_checklist.md`

## Known Non-Blocking Notes

- `pnpm format:check` is still hygiene debt and not the preview blocker
- local `SSL_CERT_FILE` issues are environment-specific and must not be “fixed” with TLS bypasses

## Done

Preview deployment setup is ready for QA when:

- web is live on Vercel
- API is live on Railway
- hosted preview validator passes
- hosted preview smoke passes
- manual tester checklist can begin
