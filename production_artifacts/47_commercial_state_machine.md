# 47 Commercial State Machine

## Source Of Truth Ownership

- booking request: intake history truth
- job: operational truth
- quote: commercial proposal truth
- invoice: receivables truth
- payment record: payment attempt truth
- Stripe webhook: final paid-state trigger

## Cross-Entity Model

### Booking Request

- `submitted`
- `under-review`
- `accepted`
- `declined`
- `archived`

### Job

- `draft`
- `quote-prep`
- `quoted`
- `confirmed`
- `completed`
- `cancelled`
- `archived`

### Quote

- `draft`
- `ready-to-send`
- `sent`
- `accepted`
- `declined`

### Invoice

- `draft`
- `sent`
- `viewed`
- `deposit-requested`
- `deposit-paid`
- `balance-due`
- `paid`
- `declined`
- `void`

### Payment Record

- `pending`
- `succeeded`
- `failed`
- `cancelled`

## Phase 5 Transitions

1. booking request accepted -> job draft created
2. job draft -> quote draft created
3. quote saved with priced items -> `ready-to-send`
4. quote sent -> job `quoted`
5. public quote accept -> quote `accepted`, job `confirmed`
6. accepted quote -> invoice draft
7. invoice send
   - full-payment invoice -> `sent`
   - deposit invoice -> `deposit-requested`
8. public payment session request -> payment record `pending`
9. Stripe webhook success
   - full-payment -> invoice `paid`
   - deposit -> invoice `deposit-paid`
   - balance -> invoice `paid`

## Phase 5 Invariants

- booking history is never destroyed during commercial conversion
- one job does not create duplicate quote or invoice records unless future revision support is added explicitly
- quote and invoice totals are recomputed server-side
- webhook, not client state, owns final paid-state
- creator-scoped client linkage remains stable across the chain

## Forward Compatibility Notes

- GST and tax reporting should aggregate from invoice and payment truth, not from UI state
- split payout support should extend payment orchestration, not replace invoice/payment truth
- quote revision support should create explicit versioning rather than mutating accepted history invisibly

## Approval Gates

- accepted job/commercial parentage
- webhook-owned paid-state
- single commercial record per job baseline for Phase 5
