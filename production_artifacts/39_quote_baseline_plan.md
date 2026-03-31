# 39 Quote Baseline Plan

## Scope

Phase 4 defines quote-ready architecture only. It does not implement sending quotes, invoice issuance, payment collection, deposits, or tax reporting.

## Contracts Added

- `QuoteDraftRecord`
- `QuoteDraftLineItem`
- `QuoteDraftStatus`

## Persistence Stubs Added

- `quote_drafts`
- `quote_line_items`

## Baseline Shape

- quote draft identity links to a single job
- line items carry:
  - label
  - description
  - quantity
  - unit amount
  - sort order
- monetary totals carry:
  - subtotal
  - tax
  - total
- currency code is explicit

## Forward Compatibility

- quote drafts hang off jobs, not raw booking requests
- totals are minor-unit based for later invoice and payment integrity
- tax field is present so later GST logic can layer on without reshaping the contract
- quote acceptance can later feed invoice generation without moving the booking source record

## Assumptions

- The job draft is the correct operational anchor for future quotes and invoices.
- Tax behavior should be modeled as data-ready now but not operationally active yet.

## Risks

- No pricing rules or package logic yet
- No locking/versioning behavior yet for quote revisions

## Approval Gates

- Approve job-owned quote drafts as the future quoting anchor.
- Approve deferring all send/accept/payment behavior to later phases.
