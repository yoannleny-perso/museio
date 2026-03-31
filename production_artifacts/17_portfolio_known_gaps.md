# 17 Portfolio Known Gaps

## Persistence

- Portfolio currently uses a seeded in-memory API store, not real Supabase tables
- no RLS, migrations, or storage integration were implemented in this phase

## Editing Depth

- hero/settings editing is implemented
- collection item CRUD for photos, videos, releases, events, and featured cards is not yet implemented
- section add/remove currently supports the starter section set, not arbitrary multi-instance custom sections

## Public Surface

- booking is a placeholder entry route only
- OG image generation is not implemented yet
- social preview hardening and canonical URL environment strategy still need a dedicated follow-up

## Auth

- demo-auth fallback exists for local protected-shell access until full auth UX ships
- real server-validated session enrichment beyond the Supabase session shell is still pending

## Tooling

- Next.js build still reports the shared ESLint config is missing the official Next plugin wiring
- Expo still reports an `expo-router` peer mismatch with `expo-constants`
- sandbox port-listen restrictions prevented a final bound-port smoke test even though the Nest app started and mapped routes successfully

## Architecture Follow-Up

- once Supabase schema work begins, the in-memory Portfolio repository should be replaced with:
  - `portfolio_settings`
  - per-collection portfolio tables
  - server-enforced handle uniqueness
  - durable section-instance ownership
- future Finance work should reuse the same shared-package runtime pattern fixed here instead of reintroducing stale package build behavior
