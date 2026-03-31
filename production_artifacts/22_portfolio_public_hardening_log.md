# 22 Portfolio Public Hardening Log

## Public Behavior

Hardened the public Portfolio flow so that:

- the API returns 403 for private portfolios
- the API returns 404 for missing handles
- the web app returns a true 404 for missing handles
- the public page only renders enabled sections with content
- disabled sections with stored content stay hidden from live mode

## Canonical URL Strategy

- `PortfolioPublicState` now includes `canonicalUrl`
- canonical URLs are built from `NEXT_PUBLIC_APP_URL` plus `/:handle`
- the public Next.js route emits canonical metadata

## Public Rendering Guardrails

- public read is server-owned
- public visibility is server-owned
- handle uniqueness is server-owned
- signed media URLs are generated server-side

## Verified Outcomes

Local verification confirmed:

- private handle requests returned 403 from the API
- published handle requests returned 200 from the API
- disabled `photos` section content remained stored but was omitted from public live mode
- missing-handle web requests returned 404 after the route hardening patch

## Deferred

- dynamic OG image generation
- custom portfolio SEO fields beyond current title/description/canonical shell
- richer public analytics or share tracking
