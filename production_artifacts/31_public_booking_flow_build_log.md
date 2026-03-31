# 31 Public Booking Flow Build Log

## Summary

Built the first real public booking route at `/:handle/book` using the persisted Portfolio handle and visibility model.

## Public Route Behavior

- `404` when the handle does not exist
- `403` when the Portfolio exists but is private
- `200` with booking UI when the Portfolio is public

## Public UI Built

- creator identity header
- public-safe availability preview
- booking request form fields:
  - client name
  - client email
  - event type
  - event notes
  - service/package notes
  - requested date/time input
  - timezone
- quick-pick buttons from exposed availability windows
- intentional empty state when no availability is currently exposed

## Persistence Behavior

- booking requests write to `booking_requests`
- requested slot blocks write to `booking_request_slots`
- public submissions are validated on the server before persistence

## Hardening Notes

- edit-mode controls are not mixed into the public route
- public booking uses the same creator resolution model as public Portfolio
- public request submission is rejected when the creator is private or when requested slots conflict with current server-owned availability

## Assumptions

- Single booking request forms are acceptable for Phase 3 as long as the contracts remain future-safe for multiple slot blocks.

## Risks

- Canonical booking confirmation, requester email confirmation, and anti-spam/rate-limit protections are not yet implemented.
- Portrait image hydration is still incomplete in the booking creator payload if a signed storage URL is needed.

## Approval Gates

- Approve the public route states and current booking form field set.
- Approve deferring requester notifications and spam controls to a later phase.
