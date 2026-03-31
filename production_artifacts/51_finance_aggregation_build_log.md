# 51 Finance Aggregation Build Log

## Summary

Implemented server-owned Finance aggregation in `apps/api/src/finance/finance.service.ts` and exposed it through:

- `GET /api/finance/workspace`
- `PUT /api/finance/tax-profile`
- `GET /api/finance/export`

## Aggregation Inputs

- `jobs`
- `clients`
- `quote_drafts`
- `invoices`
- `payment_records`
- `stripe_connected_accounts`
- `finance_tax_profiles`

## Aggregation Outputs

- overview summary
- receivables summary
- overdue aging
- forecast summary
- invoice ledger
- payment ledger
- Stripe readiness state
- tax profile
- tax summary
- intentional empty-state reason

## Key Rules Implemented

- collected cash is derived only from succeeded payment records
- invoiced totals come from invoice records
- overdue is invoice due-date driven
- accepted quote pipeline comes only from accepted quotes that do not yet have invoices
- deposits and remaining balances are derived from invoice collection mode + payment state
- GST payable remains server-owned and respects tax reporting method

## Finance Tax Persistence

Added `finance_tax_profiles` via:

- [20260331000005_finance_tax_foundations.sql](/Users/yoann/Museio/app_build/museio_app/supabase/migrations/20260331000005_finance_tax_foundations.sql)

Stored fields include:

- creator ownership
- AU country/currency baseline
- GST registration state
- GST number
- GST rate basis points
- cash vs accrual reporting method
- reserve rate basis points
- BAS/ATO readiness checklist

## Hardenings

- fixed finance validation composition so export filters and workspace filters share one canonical shape
- added finance domain helpers for report windows, tax windows, aging, forecast buckets, and reserve/tax calculations
- hardened web typecheck by changing `apps/web` to run `next typegen && tsc --noEmit` instead of assuming `.next/types` already exists

## Assumptions

- live receivable position should remain visible even when the report window is moved into the future
- forecast committed amounts may include overdue open invoices because they remain outstanding commitments
- GST is not recognized until the creator explicitly enables registration in the tax profile

## Risks

- forecast timing is intentionally simple in this phase and does not yet use richer expected-payment heuristics
- export payloads are ready for download, but not yet packaged as signed file jobs
- no refund/dispute adjustments exist yet, so paid-state is one-directional in this phase

## Approval Gates

- approve current aggregation ownership model
- approve finance tax profile persistence shape
- approve forecast simplification for Phase 6
