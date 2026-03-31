# 14 Shell Refinement Log

## Summary

Phase 2 refined both runtime shells around explicit public versus protected boundaries.

## Web

- public landing page at `/`
- protected workspace layout at `/app`
- protected portfolio editor at `/app/portfolio`
- public live portfolio at `/:handle`
- public booking placeholder at `/:handle/book`
- unavailable handling for private and missing public portfolios

## Mobile

- public route group:
  - `/`
  - `/sign-in`
- protected route group under `/app`
- protected portfolio workspace summary at `/app/portfolio`

## Auth Boundary Strategy

- Supabase session listeners remain the core auth spine
- local Phase 2 work can use a documented demo identity fallback
- production intent remains:
  - public routes stay public
  - `/app/*` remains protected
  - public portfolio routes never expose edit chrome

## Important Decisions

- the web root layout keeps auth context, but env parsing was moved away from render-time so static generation remains stable
- mobile protected navigation now redirects unauthenticated users to `/sign-in`
- the public booking page is intentionally a placeholder entry point only, not a booking flow

## Verification

- route builds passed in Next.js
- Expo Router export passed
- Nest routes mapped successfully before sandbox port-listen restrictions stopped live binding

## Residual Warnings

- Next.js still warns that the Next ESLint plugin is not yet wired into the shared ESLint config
- Expo still warns about the `expo-router` and `expo-constants` peer version mismatch
