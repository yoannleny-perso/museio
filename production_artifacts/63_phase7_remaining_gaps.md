# 63 Phase 7 Remaining Gaps

## Remaining Gaps

- no public/client reply experience yet
- no provider OAuth flow for Google Calendar
- no Calendly event ingestion depth yet
- no background sync scheduler or token refresh lifecycle
- no attachments in messages
- no notifications center or push/email notification layer
- no assistant automation over messages or CRM events yet
- no advanced agency or multi-party workflow ownership
- no refund/dispute or split-payout automation depth
- no full ATO submission depth

## Architectural Notes

- messaging should continue to hang off creator-owned threads and existing client ids
- calendar integrations should keep extending external block overlays rather than replacing availability rules
- CRM should continue to aggregate from bookings/jobs/invoices/payments rather than duplicating commercial state

## Risks To Watch

- adding client reply flows later will require careful token/auth boundaries
- provider sync drift could create stale busy blocks without explicit sync health UX
- richer CRM automation could tempt client-side state duplication if not kept server-owned
- hosted runtime verification still inherits the previously documented Node trust-store caveat on this machine

## Approval Gates

- approve current Phase 7 scope as a coordination foundation
- approve deferring OAuth sync depth, public client messaging, and advanced agency workflows
