# 12 Remaining Foundation Gaps

## Summary

Phase 1.5 produced a runnable, verified foundation, but a few intentional and non-blocking gaps remain before deeper feature slices.

## Remaining Gaps

## 1. API Runtime Packaging Hardening

Current state:

- API builds successfully
- API boots successfully via `nest start`
- compiled package/runtime import strategy is not yet finalized for deeper production packaging

Why it matters:

- future backend feature modules will rely more heavily on shared packages

Recommended follow-up:

- harden server-runtime resolution for shared workspace packages before major API module expansion

## 2. Auth UX Is Still Skeleton-Level

Current state:

- session providers and route guards exist
- sign-in views are shell placeholders

Missing:

- actual sign-in flow
- auth error UX
- refresh/reconnect UX
- profile hydration beyond `user: null`

## 3. Supabase Integration Is Foundation-Only

Current state:

- Supabase clients exist in mobile, web, and API

Missing:

- real auth flow wiring
- schema
- RLS
- domain repositories/services
- storage policies

## 4. Next.js ESLint Integration Warning

Current state:

- Next build succeeds
- build emits a warning that the Next ESLint plugin is not yet integrated into the shared ESLint config

Impact:

- non-blocking for current foundation

## 5. Expo Peer Warning

Current state:

- mobile build and boot succeed
- package install still reports an `expo-router` / `expo-constants` peer warning

Impact:

- non-blocking for current foundation
- should be revisited before heavier mobile slice work

## 6. No Real CI Runtime Boot Verification

Current state:

- CI verifies install, lint, typecheck, and test

Missing:

- boot verification in CI
- build verification in CI

Recommendation:

- add build verification to CI soon
- keep boot checks local for now unless a dedicated strategy is approved

## 7. No Authenticated App Shell Composition Yet

Current state:

- protected route placeholders exist

Missing:

- navigation shell
- route groups for real creator features
- setup gating

This is intentionally deferred to later phases.

## 8. No Signed Public Action Contract Yet

Current state:

- public vs protected route split is established

Missing:

- signed quote/invoice/payment action model
- revocation/expiry handling

This will matter before invoicing, payments, and booking conversions.

## 9. No Shared Config Package Yet

Current state:

- env validation exists in `packages/validation`

Missing:

- dedicated `packages/config`
- centralized runtime feature flags/constants

This is not blocking yet, but it will become useful once multiple feature slices are active.

## Recommended Next Work Before Deep Feature Delivery

1. design-system extraction implementation
2. auth UI and profile hydration strategy
3. shared config package
4. API runtime package resolution hardening
5. Portfolio vertical slice planning and contracts

## Assumptions

- the next phase will remain contract-first and not jump directly into Figma-seed feature porting

## Risks

- skipping API runtime hardening too long could slow backend slices later
- skipping signed public-action design too long could create route/security churn when Finance and Booking deepen
