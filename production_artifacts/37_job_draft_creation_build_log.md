# 37 Job Draft Creation Build Log

## Summary

Implemented server-owned conversion from an accepted booking request into a job draft.

## What Was Added

- `jobs` table
- `job_requested_slots` table
- booking request linkage columns:
  - `client_id`
  - `job_draft_id`
  - `converted_to_job_at`
- shared `JobDraftRecord` contract
- server conversion flow inside the booking service

## Conversion Behavior

On `accept-into-job-draft`:

- validate the transition server-side
- find or create the creator-scoped client
- create exactly one job draft for that booking request
- copy requested slot blocks into `job_requested_slots`
- link the booking request to the client and job draft
- record activity events for linkage and conversion

## Initial Job Status Model

- `draft`
- `quote-prep`
- `quoted`
- `confirmed`
- `completed`
- `cancelled`
- `archived`

Phase 4 only creates `draft`.

## State Machine Note

The job status model is intentionally quote-ready but not yet quote-driven. That keeps later quote, invoice, deposit, and finance phases forward-compatible without introducing payment behavior now.

## Assumptions

- One booking request should own at most one job draft.
- Future quote and invoice layers should hang off the job draft, not off raw booking requests.

## Risks

- No explicit reschedule or cancellation workflow for jobs yet
- No separate job detail UI yet in this phase

## Approval Gates

- Approve one-job-per-booking-request as the conversion rule.
- Approve the initial job status set and the choice to create only `draft` jobs in this phase.
