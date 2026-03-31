# 64 Hosted Runtime Verification Log

## Summary

Phase 8 hosted runtime verification isolated the previously documented `SELF_SIGNED_CERT_IN_CHAIN` issue to the local Node process environment on this machine, not to Museio application code, Supabase schema, or hosted deployment wiring.

## What Was Verified

- Verified this shell exports `SSL_CERT_FILE=/Users/yoann/.certs/corp-root.pem`.
- Reproduced hosted Supabase failure from Node with that environment present:
  - `TypeError: fetch failed`
  - cause code: `SELF_SIGNED_CERT_IN_CHAIN`
- Verified `curl` to the hosted Supabase REST endpoint succeeds from the same machine.
- Verified a fresh Node process succeeds when launched with `env -u SSL_CERT_FILE ...`.
- Started the Nest API against the hosted Supabase project with `env -u SSL_CERT_FILE` on port `4001`.
- Verified hosted Nest runtime data access by requesting:
  - `GET http://127.0.0.1:4001/api/portfolio/public/definitely-missing-launch-check`
  - result: `404 {"message":"Portfolio handle not found.","error":"Not Found","statusCode":404}`
- Started Next.js on port `3002` with hosted API base URL pointing at the hosted-mode Nest runtime.
- Verified hosted Next.js server-side path execution by requesting:
  - `GET http://127.0.0.1:3002/definitely-missing-launch-check`
  - result rendered the Next not-found document, proving the SSR path completed through the hosted-mode API.

## Finding

The trust-store issue is machine-local and process-startup scoped.

- It is not a Supabase schema/RLS/storage problem.
- It is not a NestJS route-mapping problem.
- It is not a Next.js route/rendering problem.
- It is not caused by app code setting `NODE_TLS_REJECT_UNAUTHORIZED` or any TLS bypass.
- It is triggered when Node inherits the local `SSL_CERT_FILE` override.
- Clearing `SSL_CERT_FILE` after process startup is not sufficient; the process must be launched without it.

## Practical Resolution

Supported local verification path:

```sh
env -u SSL_CERT_FILE <command>
```

Examples used in this phase:

```sh
env -u SSL_CERT_FILE node ...
env -u SSL_CERT_FILE npm exec -- pnpm --filter @museio/api start
env -u SSL_CERT_FILE npx playwright install chromium
```

## Code / Tooling Added

- `app_build/museio_app/scripts/diagnostics/verify-hosted-runtime.mjs`
- `app_build/museio_app/package.json`
  - `verify:hosted-runtime`

## Remaining Caveat

`pnpm verify:hosted-runtime` is useful as a detector, but because Node loads trust material at process start, the in-process fallback probe cannot fully neutralize `SSL_CERT_FILE`. The reliable workaround remains launching the verifying process itself with `env -u SSL_CERT_FILE`.

## Launch Impact

- Hosted runtime is not blocked by application code.
- Local verification on this specific machine requires environment isolation.
- CI or deployment runners should be checked for similar custom CA overrides before launch sign-off.
