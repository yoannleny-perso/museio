# 10 Auth Spine Plan

## Goal

Add the minimum auth/session spine required to support future protected creator routes while preserving:

- public anonymous web access for portfolio and booking surfaces
- strict separation between auth foundations and product feature flows

## Scope

Included:

- shared auth/session contracts
- Supabase session access pattern
- auth provider/context strategy for web and mobile
- protected route strategy
- public/anonymous route strategy
- API auth session contract endpoint

Excluded:

- sign-in UI flows
- onboarding
- profile editing
- RBAC enforcement beyond baseline route separation
- feature-specific auth policies

## Core Strategy

### Shared contracts

Use shared package contracts for:

- `AuthUser`
- `ProfileShell`
- `TenantIdentity`
- `AppRole`
- `SessionSnapshot`

### Web

- use a client-side `AuthProvider`
- read Supabase session state
- expose `ProtectedRoute` wrapper for creator routes
- leave public routes available for anonymous access

### Mobile

- use a native `AuthProvider`
- read Supabase session state
- expose `ProtectedScreen` wrapper for future creator routes
- keep sign-in shell separate from protected creator shell

### API

- expose a minimal auth session contract endpoint
- reserve orchestration authority for future auth module expansion

## Route Strategy

### Protected creator routes

Reserved for:

- `/app/*` on web
- `/app` and future creator-native routes on mobile

### Public routes

Reserved for:

- `/`
- `/auth/sign-in`
- `/:handle`
- `/:handle/book`
- mobile public/sign-in entry screens

This is intentionally aligned with the future split between:

- Portfolio live mode
- public booking
- creator workspace
- future signed quote/invoice/payment routes

## Architectural Implications

### Portfolio

The auth spine reinforces the corrected Portfolio rule:

- public portfolio remains anonymous web
- creator editing remains protected

### Finance

The auth spine reinforces the corrected Finance rule:

- Finance is a protected creator workspace
- public payment routes will later be signed, constrained, and separate from creator auth

### API

Future backend slices should treat auth/session and signed public actions as distinct concerns.

## Assumptions

- Supabase Auth is the session authority
- app-specific user/profile enrichment will be layered later on top of the raw session

## Risks

- current auth foundation is intentionally thin and does not yet include refresh/error UX depth
- route wrappers are a shell, not a complete authorization system

## Approval Gates

- Gate 1: approve the public vs protected route split
- Gate 2: approve shared auth contracts as the baseline app identity model
- Gate 3: approve future signed public action routes as separate from authenticated creator routes
