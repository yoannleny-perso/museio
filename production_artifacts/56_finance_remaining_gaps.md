# 56 Finance Remaining Gaps

## Remaining Gaps

- no dedicated Finance mobile workspace yet
- no refund, dispute, chargeback, or credit-note handling
- no multi-currency handling
- no accountant-grade ledger/journal layer
- no BAS submission flow
- no ATO export packaging beyond structured summaries and generic CSV/JSON
- no payout reconciliation depth beyond Stripe readiness/account state
- no split-payout automation depth
- no tax exemptions or mixed-tax class support
- no scheduled report jobs or async export generation

## Architectural Notes For Later Phases

- Finance should continue to consume invoice and payment truth, never job-status shortcuts
- GST/tax expansion should extend current tax-profile and summary contracts, not replace them
- refunds/disputes should flow through payment/invoice truth so reporting remains reconcilable
- future Finance dashboards can add depth safely on top of the current API without moving business logic to clients

## Risks To Watch

- creators may want period-filtered ledgers plus live-position cards at the same time; the UI language will matter
- later deposits/balance collections, refunds, and tax adjustments may require additional derived metrics in the API
- hosted runtime verification on this machine may still be affected by the previously documented Node trust-store caveat

## Approval Gates

- approve current Finance scope as a foundation, not a complete accounting suite
- approve deferring BAS submission, refund/dispute handling, and payout reconciliation depth
