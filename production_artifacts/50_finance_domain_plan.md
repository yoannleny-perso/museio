# 50 Finance Domain Plan

## Objective

Phase 6 rebuilds Finance as a server-owned workspace derived from commercial truth already established in Bookings, Jobs, Quotes, Invoices, and Payments.

## Source-of-Truth Ownership

- `booking_requests` remain immutable intake history and are not used as money truth.
- `jobs` provide operational parentage only.
- `quote_drafts` provide pipeline truth before invoicing.
- `invoices` provide issued receivables truth.
- `payment_records` provide collected-cash truth.
- Stripe webhook outcomes remain the final owner of paid-state updates.
- `finance_tax_profiles` provide creator-scoped AU tax configuration.

## Shared Contracts Added

- `FinanceWorkspaceFilters`
- `ResolvedFinanceWorkspaceFilters`
- `FinanceOverviewSummary`
- `FinanceReceivablesSummary`
- `FinanceOverdueSummary`
- `FinanceForecastSummary`
- `FinanceTaxProfile`
- `FinanceTaxSummary`
- `FinanceInvoiceLedgerEntry`
- `FinancePaymentLedgerEntry`
- `FinanceWorkspaceState`
- `FinanceExportInput`
- `FinanceExportPayload`

## Reporting Windows

- Report windows shape issued/paid-period summaries.
- Tax windows shape GST/tax summaries.
- Open receivables and overdue remain live-position metrics rather than historical-period-only metrics.

This is intentional so creators can ask two different questions without losing fidelity:

- what happened in a period
- what is still outstanding right now

## AU-First Tax/GST Baseline

- country baseline: `AU`
- currency baseline: `AUD`
- GST registration is explicit, not assumed
- reporting methods supported:
  - `cash`
  - `accrual`
- reserve target is configuration-driven and reporting-ready
- BAS/ATO readiness is modeled as structured checklist state, not implied UI text

## Assumptions

- Finance is creator-scoped in this phase.
- One invoice per job remains the enforced commercial baseline from the current phase.
- One quote per job remains the current baseline.
- Refunds, disputes, credit notes, and split-payout settlement depth remain out of scope.
- GST summaries should zero out until the creator explicitly marks GST registration active.

## Risks

- Users may interpret custom report windows as filtering all live receivables; the UX and docs need to keep the distinction clear.
- Reserve targets are advisory in this phase and do not yet drive ledger entries or cash segregation.
- Stripe readiness is surfaced, but payout reconciliation depth is still deferred.

## Approval Gates

- Approve server-owned invoice/payment truth as the only Finance source.
- Approve AU-first GST defaults and explicit `gstRegistered` gating.
- Approve the distinction between period summaries and live receivable position.
- Approve JSON/CSV export-ready contracts as sufficient for this phase before BAS/ATO submission depth.
