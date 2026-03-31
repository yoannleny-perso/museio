# 46 Public Commercial Flow Log

## Public Surfaces Added

- `/quote/[token]`
- `/invoice/[token]`

These routes render only token-scoped public commercial state. Creator-only operational data stays behind protected creator routes.

## Public Quote Flow

- tokenized quote fetch
- public accept
- public decline
- no creator editing controls exposed

## Public Invoice Flow

- tokenized invoice fetch
- phase-aware payment CTA rendering
- deposit and balance actions shown only when server allows them
- no creator-only internal state exposed

## Server Validation

- invalid token -> not found
- expired token -> forbidden
- quote responses allowed only while `sent`
- invoice payment phases allowed only when server-derived status permits them
- creator Stripe readiness enforced before public payment session creation

## Intentional Safety Choices

- token plaintext is one-time output at send time only
- database stores token hashes, not plaintext tokens
- public routes do not expose creator notes, private identifiers beyond linked public state, or operational control surfaces
- public payment and acceptance actions are stateless from the client perspective and revalidated on every request

## Deferred

- dynamic OG image generation
- richer viewed-state tracking
- branded email delivery for public commercial links

## Approval Gates

- tokenized public quote flow
- tokenized public invoice flow
- explicit separation between creator workspace and public commercial surfaces
