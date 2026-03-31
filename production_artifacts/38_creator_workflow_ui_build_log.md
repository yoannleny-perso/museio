# 38 Creator Workflow UI Build Log

## Summary

Refined the protected booking workflow so creators can review requests, add internal notes, see timeline activity, and convert accepted requests into job drafts.

## UI Changes

Inbox improvements:

- client linkage badge
- job draft badge
- richer request summaries

Request detail improvements:

- decision note field
- creator actions:
  - mark under review
  - decline
  - accept into job draft
  - archive
- internal notes panel
- booking activity timeline
- client linkage state
- job conversion state

## Behavior Notes

- decision availability is driven by server-owned transition rules
- internal notes are creator-only
- the public request history remains intact even after conversion

## Assumptions

- The request detail page is the right place for first-pass booking operations before a full jobs workspace exists.

## Risks

- Mobile creator workflow for these operations is still deferred
- Timeline is currently read-only and does not yet expose actor names beyond ids

## Approval Gates

- Approve the request-detail-centric creator workflow for this phase.
- Approve deferring dedicated client and job management screens.
