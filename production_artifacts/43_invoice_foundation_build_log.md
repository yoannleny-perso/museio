# 43 Invoice Foundation Build Log

## Summary

Phase 5 added the first durable invoice layer on top of jobs and accepted quotes.

## What Was Added

- shared invoice contracts in `packages/types/src/invoice.ts`
- shared invoice validation in `packages/validation/src/invoice.ts`
- commercial money helpers in `packages/domain/src/commercial.ts`
- invoice persistence in `supabase/migrations/20260331000004_commercial_foundations.sql`
- creator invoice actions in `apps/api/src/commercial/commercial.controller.ts`
- invoice orchestration in `apps/api/src/commercial/commercial.service.ts`
- protected creator invoice editing UI in `apps/web/src/commercial/job-detail.tsx`
- public invoice review and payment entry UI in `apps/web/src/commercial/public-invoice.tsx`

## Persistence Added

- `invoices`
- `invoice_line_items`
- `payment_records`
- `stripe_connected_accounts`
- `stripe_webhook_events`

## Invoice Behavior

- invoice drafts can be created from a job
- accepted quote linkage is preserved when available
- line items and totals persist durably
- send-state persists with issue/send timestamps
- public invoice actions require a tokenized route
- invoice paid-state is webhook-driven, not client-driven

## Invoice Status Baseline

- `draft`
- `sent`
- `viewed`
- `deposit-requested`
- `deposit-paid`
- `balance-due`
- `paid`
- `declined`
- `void`

## Guardrails

- creator-only invoice creation and editing
- one invoice per job in this phase
- invoice totals always recomputed server-side
- public token stored as hash
- no final paid-state without webhook processing

## Assumptions

- attachment support is contract-ready but file workflow is still baseline-only
- invoice derivation from accepted quote is preferred, but not mandatory for every future path
- `viewed`, `declined`, and `void` are contract-ready states even where the UI depth is still minimal

## Approval Gates

- invoice status baseline
- one-invoice-per-job Phase 5 constraint
- webhook-owned paid-state truth
