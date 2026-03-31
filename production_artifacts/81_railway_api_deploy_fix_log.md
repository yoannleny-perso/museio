# 81 Railway API Deploy Fix Log

## Summary

Prepared the Railway API service for a runtime-safe monorepo deployment.

The failure mode was consistent with Railway starting the API without first building the shared workspace packages that the API loads at runtime, especially `@museio/domain`, `@museio/types`, and `@museio/validation`.

## Root Cause

- The shared packages are workspace-linked into `apps/api/node_modules/@museio/*`.
- Those packages resolve their runtime entrypoints from `dist/`.
- Railway had deployment config that built only `apps/api` in one path and started the API with a Nest CLI path in another path.
- If the shared package `dist/` folders were missing in the deploy image, the compiled API failed with module resolution errors such as `Cannot find module ... @museio/domain/dist/index.js`.

## Audit Findings

### Shared packages

- `packages/types`
  - emits runtime JS to `dist/`
  - now exports type declarations from `dist/*.d.ts`
  - now declares `files: ["dist"]`
  - now excludes `src/**/*.test.ts` from emit

- `packages/validation`
  - emits runtime JS to `dist/`
  - now exports type declarations from `dist/*.d.ts`
  - now declares `files: ["dist"]`
  - now excludes `src/**/*.test.ts` from emit

- `packages/domain`
  - emits runtime JS to `dist/`
  - now exports type declarations from `dist/*.d.ts`
  - now declares `files: ["dist"]`
  - now excludes `src/**/*.test.ts` from emit

- `packages/ui`
  - audited for consistency even though Railway API does not consume it at runtime
  - now exports declarations from `dist/*.d.ts`
  - now declares `files: ["dist"]`
  - now excludes test files from emit

### API app

- `apps/api`
  - previously had `start: nest start`
  - now starts compiled output with `node dist/main.js`
  - build now clears stale `dist/` before compile

## Config Changes

### Runtime-safe build scripts

- Updated package build scripts to:
  - `rm -rf dist && tsc -p tsconfig.json`
- Updated API build script to:
  - `rm -rf dist && nest build`

### Runtime-safe API start path

- Updated `apps/api/package.json`
  - `start` -> `node dist/main.js`
  - `start:prod` -> `node dist/main.js`

- Updated root `package.json`
  - `start:api:railway` -> `pnpm --filter @museio/api start:prod`

### Railway deployment config

- Updated [`railway.json`](/Users/yoann/Museio/app_build/museio_app/railway.json)
  - `build.buildCommand` -> `pnpm build:api:railway`
  - `deploy.startCommand` -> `pnpm start:api:railway`

- Updated [`railway.toml`](/Users/yoann/Museio/app_build/museio_app/railway.toml)
  - `buildCommand` -> `pnpm build:api:railway`
  - `startCommand` -> `pnpm start:api:railway`

This makes Railway use the root monorepo-aware build path that compiles:

1. `@museio/types`
2. `@museio/validation`
3. `@museio/domain`
4. `@museio/api`

in dependency order.

## Verification Performed

### Build verification

- Ran:
  - `npm exec -- pnpm build:api:railway`
- Result:
  - passed
  - confirmed dependency-ordered build of shared packages before API

### Emit verification

- Confirmed clean `dist/` output exists for:
  - `packages/types/dist`
  - `packages/validation/dist`
  - `packages/domain/dist`
  - `packages/ui/dist`

- Confirmed stale emitted test files are no longer present after clean rebuild.

### Compiled runtime verification

- Ran the Railway-equivalent compiled start path with minimal required env:
  - `PORT=4101 API_PORT=4101 SUPABASE_URL=http://127.0.0.1:54321 STRIPE_SECRET_KEY=sk_test_placeholder npm exec -- pnpm start:api:railway`
- Result:
  - passed
  - Nest booted successfully through route mapping using `node dist/main.js`

## Assumptions

- Railway deploys from `app_build/museio_app/` as the service root.
- Railway provides `pnpm` through Nixpacks/Railpack setup.
- Runtime env vars such as `SUPABASE_URL` and `STRIPE_SECRET_KEY` are provided by Railway at deploy time.

## Remaining Risks

- If Railway is pointed at the wrong root directory, the workspace-aware build commands will not resolve correctly.
- If multiple Railway config files are active in an unexpected precedence order, the service should still be safe because both `railway.json` and `railway.toml` now point to the same build and start commands.
- This fix addresses packaging/runtime integrity only; it does not change API feature behavior.

## Approval Gate

The Railway API deployment fix is prepared and verified locally. The next safe step is to redeploy the Railway service using the updated monorepo root build/start commands and confirm the hosted service boots without shared-package module resolution errors.
