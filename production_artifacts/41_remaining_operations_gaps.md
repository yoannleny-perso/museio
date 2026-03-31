# 41 Remaining Operations Gaps

## Out Of Scope By Design

- Stripe and payment collection
- deposits
- finance ledger behavior
- tax workflows
- messaging
- calendar sync
- Gmail sync
- invoice generation and send flow

## Functional Gaps

- no dedicated client directory UI yet
- no dedicated jobs workspace yet
- no quote editor yet beyond contracts and persistence stubs
- no reschedule/cancel workflow for job drafts yet
- no request assignment, SLA, or escalation model yet

## Technical Gaps

- booking conversion is server-owned but still implemented as service-layer orchestration rather than a single database transaction primitive
- hosted Node runtime verification caveat remains visible on this machine
- quote draft tables exist, but no operational quote APIs are implemented yet

## Product Gaps

- no CRM enrichment beyond display name and primary email
- no financial commitment state on jobs yet
- no client communications or templates yet

## Forward Path

- quote drafting on top of jobs
- invoice generation from accepted quotes
- deposits and payment state
- finance posting and tax-ready reporting
- richer CRM and client history

## Approval Gates

- Approve moving next into quote/invoice preparation or into richer jobs/CRM surfaces.
- Approve keeping finance and payment behavior out of this phase retrospectively.
