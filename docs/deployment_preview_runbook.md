# Preview Deployment Runbook

## Goal

Deploy Museio preview with:

- web on Vercel
- API on Railway
- Supabase as the shared managed backend

This runbook is optimized for preview deployment, not final production launch.

## Deployment Shape

- GitHub repo: source of truth
- Vercel project: hosts `app_build/museio_app/apps/web`
- Railway service: hosts `app_build/museio_app/apps/api`
- Supabase: existing hosted project for auth, storage, realtime, and data

## Before You Start

Make sure you have:

- GitHub repo access
- Vercel account
- Railway account
- Supabase project access
- the current environment values from your hosted Supabase project

Do not copy secrets into source control. Add them only in provider dashboards.

## 1. Deploy The API To Railway

### Create the service

1. Open Railway.
2. Create a new project from GitHub.
3. Select this repository.
4. Set the Railway service root directory to:

```text
app_build/museio_app
```

Railway will use:

- `railway.json`
- `nixpacks.toml`

### Railway build and start behavior

The repo is already configured so Railway can:

- install the workspace with `pnpm install --frozen-lockfile`
- build the API and its shared packages with `pnpm build:api:railway`
- start the compiled API with `pnpm start:api:railway`

### Railway environment variables

Add the variables listed in:

- `docs/railway_env_template.md`

Important:

- set `NEXT_PUBLIC_APP_URL` to the Vercel preview URL
- set `NEXT_PUBLIC_API_URL` on the web side to the Railway public API URL with `/api`
- set `CORS_ALLOWED_ORIGINS` to the Vercel preview URL

### Verify Railway deployment

After deploy, open:

```text
https://<your-railway-domain>/api/health
```

Expected response:

```json
{"status":"ok","service":"api","phase":"foundations"}
```

## 2. Deploy The Web To Vercel

### Create the project

1. Open Vercel.
2. Import the GitHub repository.
3. Set the Vercel Root Directory to:

```text
app_build/museio_app/apps/web
```

Vercel will use:

- `apps/web/vercel.json`

### Vercel build behavior

The web config is set to:

- install from the workspace root
- build only the web app using `pnpm build:web:vercel`

### Vercel environment variables

Add the variables listed in:

- `docs/vercel_env_template.md`

Important:

- `NEXT_PUBLIC_API_URL` must point to the Railway API URL and include `/api`
- `NEXT_PUBLIC_APP_URL` must point to the Vercel deployment URL you want to validate

## 3. Connect Web And API Safely

The API CORS allowlist now supports:

- local development origins
- the `NEXT_PUBLIC_APP_URL` value
- `CORS_ALLOWED_ORIGINS` as a comma-separated allowlist

Preview recommendation:

- Railway `CORS_ALLOWED_ORIGINS=<vercel-preview-url>`

Future production recommendation:

- Railway `CORS_ALLOWED_ORIGINS=<vercel-preview-url>,<production-web-url>`

## 4. Run Hosted Preview Verification

Once both deployments exist:

1. collect the real URLs
2. set these environment values locally or in GitHub preview secrets:

```text
PREVIEW_APP_URL=<vercel-preview-url>
PREVIEW_API_URL=<railway-api-url>/api
PREVIEW_SUPABASE_URL=<hosted-supabase-url>
PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<hosted-publishable-key>
PREVIEW_SUPABASE_SERVICE_ROLE_KEY=<hosted-service-role-key>
```

3. run:

```bash
pnpm verify:preview-env
pnpm test:preview-smoke
```

4. then execute the manual checklist in:

- `production_artifacts/75_preview_test_checklist.md`

## 5. Optional GitHub Preview Smoke

The repo already includes a manual preview workflow in:

- `app_build/museio_app/.github/workflows/ci.yml`

Populate the GitHub `preview` environment with:

- `PREVIEW_APP_URL`
- `PREVIEW_API_URL`
- `PREVIEW_SUPABASE_URL`
- `PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `PREVIEW_SUPABASE_SERVICE_ROLE_KEY`

Then trigger the workflow manually to run:

- preview environment validation
- preview creator browser smoke

## 6. Common Beginner Mistakes

- using the Railway root as `apps/api` instead of `app_build/museio_app`
- forgetting `/api` on `NEXT_PUBLIC_API_URL`
- setting web env to one domain and API CORS to a different domain
- testing preview with local URLs still cached in provider env vars
- treating `SSL_CERT_FILE` local issues as product bugs

## 7. Definition Of Done For Preview Setup

Preview deployment setup is complete when:

- Railway API responds on `/api/health`
- Vercel web loads the landing page and sign-in page
- `pnpm verify:preview-env` passes against the real hosted URLs
- `pnpm test:preview-smoke` passes against the real hosted URLs
- manual QA can start from the preview checklist
