# 44 Deposit Orchestration Plan

## Goal

Introduce deposit-aware money handling without pushing payment truth into the client.

## Contract Decisions

- invoice collection modes:
  - `full-payment`
  - `deposit-and-balance`
- deposit config:
  - `fixed`
  - `percentage`
- payment phases:
  - `full`
  - `deposit`
  - `balance`

## Server-Owned Logic

- deposit amount is computed from invoice totals and deposit config
- remaining balance is derived from total minus amount paid
- invoice status transitions derive from collection mode plus webhook-confirmed payment state
- client only requests an allowed payment phase; the API decides whether that phase is valid

## Phase 5 Pathways

- full-payment path
  - invoice `sent`
  - public `full` payment session
  - webhook marks payment succeeded
  - invoice becomes `paid`
- deposit path
  - invoice `deposit-requested`
  - public `deposit` payment session
  - webhook marks payment succeeded
  - invoice becomes `deposit-paid`
  - later public `balance` payment session
  - webhook marks payment succeeded
  - invoice becomes `paid`

## Future Compatibility

- balance collection is already separated from deposit collection
- payment records are phase-aware, which supports:
  - split payout orchestration later
  - Finance ledger/reporting later
  - deposit reminders later
  - partial failure/retry handling later
- totals structure remains compatible with future GST treatment

## Explicit Non-Scope

- automatic reminders
- installment schedules beyond deposit/balance
- refunds
- payout automation
- Finance dashboard reporting

## Risks

- Phase 5 allows one invoice per job, so amendments still require later revision handling
- attachment and viewed-state UX are still shallow
- deposit percentages assume invoice total is the commercial base; later discounts/credits need revision support

## Approval Gates

- approved deposit model (`fixed` or `percentage`)
- approved payment phase baseline (`full`, `deposit`, `balance`)
- approved rule that paid-state only changes from webhook events
