# 29 Booking Domain Plan

## Scope

Phase 3 establishes the first durable public booking foundation on top of the existing Portfolio public handle model. It does not implement quoting, invoicing, deposits, split payouts, finance, CRM, or messaging.

## Source Of Truth

- `MASTER_PROMPT.md`
- `docs/03_portfolio_finance_truth.md`
- `docs/05_data_states_and_integrations.md`
- `production_artifacts/27_hosted_portfolio_verification_report.md`
- `production_artifacts/28_portfolio_deployment_readiness.md`

## Architectural Decisions

- Public identity is inherited from `portfolio_settings.handle` and `portfolio_settings.visibility`.
- Public/private enforcement remains server-owned in the API layer.
- Booking requests persist in Supabase and are never accepted directly from client-owned trust assumptions.
- Availability exposure is public-safe.
  Raw creator rules and internal conflict blocks stay protected.
- The first UI supports a single base window per weekday, but the shared contracts and schema support future multi-slot requests and future calendar overlays without redesign.

## Shared Contracts Added

- `BookingRequesterContact`
- `RequestedDateTimeSlotBlock`
- `BookingRequestRecord`
- `BookingRequestStatus`
- `CreatorAvailabilityRule`
- `AvailabilityConflictBlock`
- `CreatorUnavailableBlockInput`
- `PublicAvailabilityDay`
- `PublicBookingPageState`
- `CreatorBookingInboxState`
- `CreatorBookingRequestDetail`

## Status Baseline

- `submitted`
- `under-review`
- `accepted`
- `declined`
- `archived`

Blocking statuses for availability:

- `submitted`
- `under-review`
- `accepted`

## Persistence Plan

New Supabase tables:

- `creator_availability_rules`
- `creator_unavailability_blocks`
- `creator_external_calendar_blocks`
- `booking_requests`
- `booking_request_slots`

Shape decisions:

- booking requests are creator-owned and also snapshot the portfolio handle at submission time
- requested time blocks are stored in a separate child table for future multi-slot support
- unavailability and external calendar overlays are modeled separately so future integrations do not mutate creator-authored base availability

## Public Flow Plan

- Route: `/:handle/book`
- Resolve creator through the Portfolio handle
- Return:
  - `404` for missing handles
  - `403` for private portfolios
  - `200` with public-safe availability for public portfolios
- Accept booking requests only when every submitted slot still fits exposed availability

## Creator Flow Plan

- Protected inbox route: `/app/bookings`
- Protected request detail route: `/app/bookings/[requestId]`
- Creator can:
  - review requests
  - change request status
  - manage weekly availability
  - manage manual or vacation blocks

## Assumptions

- One creator account owns one active portfolio settings record.
- Booking requests attach to creator identity today and can later attach to jobs/clients without breaking the core contracts.
- Future calendar sync will populate `creator_external_calendar_blocks` instead of rewriting creator rules.

## Risks

- Timezone handling is subtle; all server persistence uses ISO timestamps and explicit timezone fields, but richer timezone UX still needs follow-up.
- Accepted and under-review requests currently block availability immediately. That is intentional for safety, but future workflow policy may need more nuance.
- Public booking currently relies on the existing Portfolio being configured first.

## Approval Gates

- Confirm the status baseline is acceptable for V1 booking intake.
- Confirm blocking `submitted` requests is the intended operational behavior.
- Confirm the one-window-per-day creator UI is acceptable as a foundation while contracts remain future-ready.
