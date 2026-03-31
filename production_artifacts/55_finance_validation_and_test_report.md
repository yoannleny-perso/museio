# 55 Finance Validation And Test Report

## Verification Summary

Phase 6 Finance verification passed locally against the active local Supabase-backed stack and API.

## Tooling Checks

- `npm exec -- pnpm lint` passed
- `npm exec -- pnpm typecheck` passed
- `npm exec -- pnpm test` passed
- `npm exec -- pnpm build` passed

## Domain/Test Coverage Added

- finance report window resolution
- aging bucket allocation
- proportional GST allocation from payments
- forecast bucket allocation
- reserve target calculation

## End-to-End Scenario Verified

Created and validated a creator scenario with:

- one deposit-path invoice
- one fully paid invoice
- one overdue unpaid invoice
- one accepted quote without invoice
- one connected Stripe-ready account state

## Verified Outcomes

- empty Finance state returns intentional messaging
- outsider/other creator does not see another creator's Finance truth
- overview totals reconcile from invoices and payment records:
  - collected: `539000`
  - invoiced: `990000`
  - receivables: `451000`
  - overdue: `220000`
  - deposits collected: `99000`
  - accepted quote pipeline: `165000`
- overdue is invoice-driven, not job-driven
- open invoice count is `2`
- payment ledger contains `2` succeeded records
- Stripe readiness surfaces as `ready`
- default tax profile keeps GST values at `0` until GST registration is enabled
- switching to GST registered + accrual reporting produced:
  - taxable sales: `900000`
  - GST collected/payable: `90000`
  - GST outstanding: `41000`
  - reserve target: `135000`
- custom future report windows zero out period activity while leaving live receivable position intact
- CSV and JSON export payloads returned successfully

## Notes On Filter Semantics

- period filters affect issued/paid activity summaries
- receivables, overdue, and some balance surfaces remain live current position metrics

This is intentional and should remain visible in future UX copy.

## Verification Limits

- `supabase db reset --yes` was previously validated in the active local workflow, but the current shell session did not have a durable global Supabase CLI binary available; this phase’s final verification used the already-running local Supabase-backed environment instead of re-provisioning it from scratch mid-turn
- hosted runtime smoke checks were not re-run in this phase
- the known hosted Node trust-store caveat remains relevant for hosted runtime checks on this machine

## Approval Gates

- approve the current reconciliation behavior
- approve live-position vs period-summary semantics
- approve local verification evidence as sufficient for Phase 6 completion
