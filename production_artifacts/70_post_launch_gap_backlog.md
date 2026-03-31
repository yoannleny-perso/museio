# 70 Post Launch Gap Backlog

## Highest Priority

- promote `pnpm test:system-smoke` into CI or release automation once a stable local/preview data plane is available
- clean the repo-wide Prettier drift and then make `format:check` a required-green CI gate
- add a preview-environment creator browser smoke that exercises the protected booking to commercial path without local orchestration hacks

## Medium Priority

- tighten CORS from broad local-dev origins into environment-specific allowlists for preview/prod
- add explicit deployment docs for trust-store-sensitive environments
- improve creator-shell copy density and navigation ergonomics for jobs, finance, CRM, and messages
- expand browser coverage for protected auth redirect and sign-out flows once the smoke harness is stabilized

## Lower Priority

- add richer trace/report artifacts for Playwright and system-smoke runs
- add a dedicated preview-health script that checks hosted API plus public Next SSR in one command
- normalize the remaining Next.js ESLint plugin warning

## Explicitly Deferred

- new feature domains
- money-state logic in the client
- TLS bypasses in app code
- weakening server-owned access, availability, or payment truth
