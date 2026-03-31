# 53 GST Tax Foundations Log

## Summary

Implemented AU-first GST foundations without introducing approximate or client-owned tax logic.

## What Was Added

- creator-scoped `finance_tax_profiles` persistence
- explicit GST registration state
- explicit reporting method:
  - `cash`
  - `accrual`
- GST rate basis points
- GST number field
- reserve target configuration
- ATO/BAS readiness checklist state

## GST Computation Rules

- `cash` reporting:
  - taxable sales and GST payable derive from succeeded payments
  - allocation is proportional against invoice tax/total
- `accrual` reporting:
  - taxable sales and GST payable derive from issued invoices inside the tax window
- outstanding GST:
  - derived from invoice balances still unpaid

## Important Product Decision

The default tax profile starts as:

- `gstRegistered: false`
- `reportingMethod: cash`

That means GST summary values remain zero until the creator explicitly enables GST registration. This avoids implying tax liability before the creator has configured tax status.

## Reporting Readiness

Current structures are compatible with later:

- BAS-period exports
- ATO-oriented summaries
- tax registration onboarding
- reserve guidance/refinement

## Assumptions

- AU is the only supported tax jurisdiction in this phase
- invoice line items already carry tax-ready amounts
- future GST-exempt and mixed-tax scenarios will extend line-item treatment rather than replace the current structure

## Risks

- refunds and credit-note adjustments are not yet modeled
- no BAS submission transport exists yet
- tax reporting remains summary/export-ready, not accountant-grade general ledger output

## Approval Gates

- approve AU-first GST-only scope
- approve explicit GST registration gating
- approve cash/accrual dual-mode handling as the foundation for later reporting depth
