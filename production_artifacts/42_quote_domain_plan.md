# 42 Quote Domain Plan

## Scope

Phase 5 introduces the first durable quote workflow on top of the existing booking, client, and job truth:

- jobs are the operational parent
- quotes belong to one job
- one accepted booking request can create at most one job draft
- one job can create at most one active quote draft in this phase
- public quote actions are tokenized and server-validated

## Contracts Added

- `QuoteRecord`
- `CommercialLineItem`
- `CommercialTotals`
- `QuoteStatus`
- `QuoteResponseAction`
- `CreateQuoteDraftInput`
- `SaveQuoteDraftInput`
- `SendQuoteInput`
- `RespondToQuoteInput`
- `PublicQuoteState`

These live in shared packages so the API, web app, and future mobile surfaces all consume the same TypeScript truth.

## Quote State Model

- `draft`
  - seeded from a job draft
  - editable by creator only
- `ready-to-send`
  - quote has valid priced line items
  - still editable by creator
- `sent`
  - public token issued
  - no further line item edits allowed
- `accepted`
  - recorded by public token action
  - job becomes commercially confirmed
- `declined`
  - recorded by public token action

## Persistence Shape

- `quote_drafts`
  - creator ownership
  - job linkage
  - money totals
  - public token hash and expiry
  - send/respond timestamps
- `quote_line_items`
  - creator ownership
  - quote linkage
  - per-line quantity, unit amount, tax rate, computed subtotal/tax/total

## Server-Owned Rules

- quote totals are recomputed on the server
- public token plaintext is only returned at send time
- database stores token hash, not plaintext token
- only creator-owned jobs can create/edit/send quotes
- only `sent` quotes can be publicly accepted or declined

## Future Compatibility

- line item model is already compatible with later quote revisions and invoice derivation
- totals structure is tax-ready for later GST treatment
- public acceptance model can later attach signature/approval metadata without changing the job parentage

## Assumptions

- one job -> one quote in this phase is the safest commercial baseline
- quote revision history is deferred
- quote send is treated as a durable commercial handoff, so edits stop once public action is possible

## Approval Gates

- approved line item contract shape
- approved single-quote-per-job constraint for Phase 5
- approved public token acceptance pattern as the only public quote action path
