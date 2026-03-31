# 32 Creator Booking Inbox Build Log

## Summary

Implemented the protected creator booking shell with request visibility, request detail review, and availability editing.

## Protected Routes

- `/app/bookings`
- `/app/bookings/[requestId]`

## Inbox Capabilities

- owner-scoped request listing
- request detail review
- status transitions:
  - `under-review`
  - `accepted`
  - `declined`
  - `archived`
- weekly base availability editing
- manual and vacation block editing
- public availability preview feedback

## Intentional Setup State

Creators without a configured Portfolio now see an intentional setup state instead of a broken error shell. The inbox explains that booking depends on the Portfolio handle and links back to `/app/portfolio`.

## Ownership Rules

- creator inbox queries are filtered by the authenticated creator user id
- request detail queries are filtered by creator ownership
- status updates are filtered by creator ownership

## Assumptions

- Booking remains a creator-owned workflow until future CRM and job records are added.
- The creator inbox can remain web-first for now; mobile protected shell refinement for bookings can follow later without changing the contracts.

## Risks

- No bulk triage actions yet
- No request tagging, internal notes, or assignment model yet
- No quote or payment transitions yet by design

## Approval Gates

- Approve the current status baseline and protected inbox shape.
- Approve the setup-state behavior for creators who have not configured Portfolio yet.
