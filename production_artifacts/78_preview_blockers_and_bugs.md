# 78 Preview Blockers And Bugs

## Blockers

### 1. No real deployed preview URL was available for QA

Severity: `blocker`

Impact:

- prevents real Tasks A and B from being completed honestly
- prevents human testers from exercising the deployed web/API pair

Evidence:

- no `PREVIEW_APP_URL` or `PREVIEW_API_URL` were present in the shell environment
- `.github/workflows/ci.yml` expects preview secrets, but those values were not available from this workspace

Recommended fix:

- provision the preview web and API deployment
- populate the GitHub `preview` environment secrets:
  - `PREVIEW_APP_URL`
  - `PREVIEW_API_URL`
  - `PREVIEW_SUPABASE_URL`
  - `PREVIEW_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - `PREVIEW_SUPABASE_SERVICE_ROLE_KEY`

### 2. Real preview QA checklist execution is blocked until the preview deployment exists

Severity: `blocker`

Impact:

- human QA cannot validate the actual deployed interface yet
- rollout confidence remains conditional rather than final

Recommended fix:

- run `preview-smoke` against the deployed preview target immediately after URLs and secrets are configured
- then execute the manual tester checklist in the real preview environment

## Non-Blocker Environment Issues

### 1. Local hosted-runtime checks are still sensitive to `SSL_CERT_FILE`

Severity: `non-blocker`

Classification:

- local environment issue
- not a product bug

Observed behavior:

- inherited `SSL_CERT_FILE` causes hosted Node fetch to fail with `SELF_SIGNED_CERT_IN_CHAIN`
- isolated process launch without that override works

### 2. Repo-wide formatting drift remains unresolved

Severity: `non-blocker`

Classification:

- hygiene debt
- not a preview rollout blocker in this phase

Observed behavior:

- `pnpm format:check` still fails across broad pre-existing files

### 3. Next.js ESLint plugin warning remains present in build output

Severity: `non-blocker`

Classification:

- tooling warning
- not a launch or preview blocker based on current evidence

## Product Bugs Found In This QA Pass

None.

The preview-like local execution passed:

- public portfolio and booking smoke
- protected creator preview smoke
- release-gate system smoke

## Recommended Tester Focus Once Preview Exists

- booking intake through creator acceptance
- quote and invoice public token flows
- finance visibility after payment transitions
- messaging visibility and creator isolation
- calendar conflict masking on public booking pages
