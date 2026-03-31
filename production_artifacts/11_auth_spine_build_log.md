# 11 Auth Spine Build Log

## Summary

The minimal auth/session spine was added without implementing any product feature flows.

## Shared Contracts Added

In `packages/types`:

- `AuthUser`
- `ProfileShell`
- `TenantIdentity`
- `AppRole`
- `SessionSnapshot`

In `packages/domain`:

- `appRoles`
- protected route prefix baseline
- public route pattern baseline

## Web Auth Foundation Added

Files added:

- `apps/web/src/auth/auth-context.tsx`
- `apps/web/src/auth/protected-route.tsx`
- `apps/web/app/providers.tsx`
- `apps/web/app/app/page.tsx`
- `apps/web/app/auth/sign-in/page.tsx`

Behavior:

- web auth provider subscribes to Supabase session changes
- protected creator shell uses `ProtectedRoute`
- public landing and sign-in shell remain anonymous

## Mobile Auth Foundation Added

Files added:

- `apps/mobile/src/auth/auth-context.tsx`
- `apps/mobile/src/auth/protected-screen.tsx`
- `apps/mobile/app/app.tsx`
- `apps/mobile/app/sign-in.tsx`

Behavior:

- mobile auth provider subscribes to Supabase session changes
- protected creator shell uses `ProtectedScreen`
- sign-in shell remains separate

## API Auth Foundation Added

Files added:

- `apps/api/src/auth/auth.module.ts`
- `apps/api/src/auth/auth-session.controller.ts`

Behavior:

- API now exposes a minimal `/api/auth/session` contract route
- auth module is isolated from feature modules

## Supporting Hardening Added

- lazy env parsing in mobile/web
- lazy Supabase client creation in mobile/web
- CI workflow for install/lint/typecheck/test
- runtime-safe root package-manager setup

## Explicit Non-Goals Preserved

Not added:

- sign-in implementation
- session refresh UX
- profile loading UX
- role enforcement beyond route baseline
- feature authorization rules

## Notes For Future Portfolio/Finance Work

- Portfolio edit mode should plug into protected creator routes, while live mode remains public web.
- Finance should remain fully protected, with separate signed public payment routes introduced later.
- shared auth contracts should remain thin and transport-safe; domain-specific profile/account enrichment belongs in future domain modules, not in client-only state.
