# 28 Portfolio Deployment Readiness

## Current Readiness

Portfolio is now hosted-schema ready, but not yet fully runtime-cleared from this machine.

## Ready

- hosted Portfolio schema is applied
- hosted Portfolio tables are present
- hosted RLS policies are present
- hosted private storage bucket is present
- hosted anonymous public/private enforcement is verified
- hosted handle uniqueness is verified
- hosted owner-scoped storage upload and delete are verified
- local and hosted migration workflows are normalized around standard Supabase CLI paths

## Not Yet Cleared

- local Node-based runtime calls to hosted Supabase fail certificate validation in this environment
- because of that trust-store issue, auth-backed NestJS and Next.js hosted smoke tests are still incomplete from this machine

## Important Interpretation

This is no longer a schema or migration blocker.

It is a runtime-environment verification blocker for Node on the current operator machine.

## Why This Matters For Phase 3+

Future Booking and Finance work will depend on the same server-owned Supabase access path.

If the local or CI trust-store issue is left unresolved, backend slices may look unhealthy even when the hosted database itself is correct.

## Recommended Next Step

Before expanding scope into new vertical slices:

1. fix the local or CI certificate trust chain used by Node when calling hosted Supabase
2. rerun hosted NestJS session verification
3. rerun hosted public route verification through the real server runtime

## Assumptions

- deployed environments such as Vercel, Railway, Fly, or managed container hosts will use normal public CA trust stores
- this certificate problem is specific to the current shell environment unless proven otherwise

## Risks

- if the certificate issue also exists in CI or deployment, server-owned auth and public Portfolio fetches will fail at runtime
- if the team ignores this distinction, they may attribute an environment TLS problem to Portfolio application code

## Approval Gate

Approve Portfolio for:

- hosted schema persistence
- hosted storage readiness
- hosted data-plane validation

Do not approve full hosted rollout sign-off until the Node trust-store issue is cleared and runtime smoke tests pass.
