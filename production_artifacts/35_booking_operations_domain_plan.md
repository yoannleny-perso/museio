# 35 Booking Operations Domain Plan

## Scope

Phase 4 turns booking intake into a creator workflow, adds the first durable client layer, and creates job drafts from accepted requests. It does not implement Stripe, Finance, deposits, messaging, calendaring sync, invoicing, or tax behavior.

## Domain Decisions

- Booking remains the intake record of origin.
- Conversion does not overwrite or destroy booking history.
- Creator review rules stay server-owned.
- Client linkage is creator-scoped.
- Job draft creation is the first operational bridge out of booking.

## Shared Contracts Added

- booking decision actions
- booking internal notes
- booking activity timeline events
- client record
- job draft record
- quote draft and line-item baseline contracts

## Booking Decision Actions

- `mark-under-review`
- `decline`
- `accept-into-job-draft`
- `archive`

## Status Transition Rules

- `submitted` -> `under-review`, `accepted`, `declined`, `archived`
- `under-review` -> `accepted`, `declined`, `archived`
- `accepted` -> `archived`
- `declined` -> `archived`
- `archived` -> no further transitions

## Timeline Event Types

- `submitted`
- `status-changed`
- `internal-note-added`
- `client-linked`
- `job-draft-created`

## Assumptions

- One accepted booking request should create at most one job draft.
- A creator can receive multiple booking requests from the same requester email and they should deduplicate into one client record within that creator scope.
- Decision notes are creator-only and can safely persist as internal notes plus timeline evidence.

## Risks

- Timezone-safe scheduling semantics still need follow-through when later phases add confirmed run sheets, calendar sync, and rescheduling.
- Client dedup currently keys on creator scope plus normalized email; richer matching can come later without invalidating the base model.

## Approval Gates

- Approve the status transition map.
- Approve creator-scope email dedup as the Phase 4 client-linking rule.
- Approve keeping booking history immutable after conversion.
