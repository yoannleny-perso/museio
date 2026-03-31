# 34 Booking Remaining Gaps

## Out Of Scope By Design

- quoting
- invoicing
- deposits
- split payments
- Stripe payment flows
- finance ledger integration
- CRM depth
- requester messaging
- tax workflows

## Functional Gaps

- no requester confirmation email or creator notification pipeline yet
- no spam prevention, CAPTCHA, or rate limiting yet
- no calendar sync ingestion yet, only schema and server contract preparation
- no availability exceptions UI beyond one base window per weekday plus blocked periods
- no reschedule, cancel, or duplicate-detection workflow yet

## UX Gaps

- creator booking shell is web-first; mobile creator booking management is not implemented yet
- booking creator payload does not yet hydrate a signed portrait URL from storage
- public booking does not yet expose richer package/service selection models

## Technical Gaps

- hosted Node runtime verification still has the `SELF_SIGNED_CERT_IN_CHAIN` caveat on this machine
- availability logic should gain additional regression tests around DST boundary weeks and more timezone combinations
- creator availability writes currently replace all rules and manual blocks at once; finer-grained mutation endpoints may be useful later

## Future-Safe Follow-Ons

- external calendar ingestion should write overlay records into `creator_external_calendar_blocks`
- accepted booking requests can later fan out into job, CRM, quote, invoice, and finance records without changing the public booking submission contract
- future multi-slot creator editing can be added without changing the stored request shape because slot blocks are already normalized into a child table

## Booking And Finance Boundary Note

This phase intentionally stops before any financial commitment state. That keeps booking intake and availability separate from quote acceptance, invoice issuance, deposits, payout splits, and portfolio/finance reporting logic.

## Approval Gates

- Approve moving next into quoting and workflow orchestration, or into calendar sync, without widening Phase 3 retrospectively.
- Approve keeping finance and payment commitments out of the booking intake slice for now.
