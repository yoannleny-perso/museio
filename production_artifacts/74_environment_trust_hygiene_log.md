# 74 Environment Trust Hygiene Log

## Goal

Keep the hosted Node trust-store problem visible, isolate it honestly, and ensure no app-code TLS bypass was introduced.

## Changes

- replaced the in-process hosted runtime probe with a fresh-process probe in `scripts/diagnostics/verify-hosted-runtime.mjs`
- added `scripts/diagnostics/probe-hosted-supabase.mjs`
- added `scripts/diagnostics/check-trust-hygiene.mjs`
- added `scripts/diagnostics/validate-preview-env.mjs`
- documented `SSL_CERT_FILE` handling in `env.example`

## Verification

`pnpm verify:hosted-runtime` now reports the issue accurately:

- inherited `SSL_CERT_FILE` run fails with `SELF_SIGNED_CERT_IN_CHAIN`
- isolated fresh-process run succeeds to hosted Supabase transport and returns the expected HTTP `401` response instead of a TLS failure

`pnpm verify:trust-hygiene` passed and confirmed there is no checked-in use of:

- `NODE_TLS_REJECT_UNAUTHORIZED`
- `rejectUnauthorized: false`

## Conclusion

The hosted Node TLS issue remains machine-local and environment-driven on this workstation. It is not caused by Museio application code.

## Supported Verification Pattern

For local and CI hosted verification on runners that may inherit a bad CA override, launch the verifying process without that override:

```sh
env -u SSL_CERT_FILE <command>
```

## Risks

- a runner with an unexpected CA override can still produce false-negative hosted runtime failures
- this is especially important for ad hoc local checks and custom CI environments

## Approval Gate

Preview and release verification must continue to avoid any TLS-bypass code path. Environment isolation is acceptable; weakening Node TLS verification is not.
