# 49 Commercial Remaining Gaps

## Still Out Of Scope

- Finance dashboards
- GST/ATO reporting UI
- Stripe onboarding UX depth
- split payouts
- refunds and disputes
- invoice reminders
- Messaging/email delivery
- calendar integrations

## Technical Gaps

- hosted live Stripe verification was not run in this phase
- hosted runtime checks may still hit the known Node trust-store caveat on this machine
- quote revision/version history is not implemented
- invoice amendment/version history is not implemented
- attachment upload/storage flow is only contract-baseline, not full UX depth
- `viewed`, `declined`, and `void` invoice states exist in the model but are not deeply exercised yet

## Product Gaps

- no branded send flow yet for quote/invoice delivery
- no client-facing signature/terms capture beyond acceptance action
- no refund/cancellation money policy yet
- no commercial reminder cadence yet

## Architecture Notes For Next Phases

- Finance should report from invoice and payment truth, not from UI projections
- deposits and balances are already phase-separated, which is the correct base for later reporting and payout logic
- split payout support should extend Stripe orchestration and payment records, not fork commercial truth
- tax handling should layer onto invoice totals and line items, not create a parallel totals system

## Approval Gates

- approve move into hosted Stripe/live verification phase
- approve whether quote and invoice revisions are the next commercial hardening step
- approve whether branded delivery or Finance reporting comes first after live payment validation
