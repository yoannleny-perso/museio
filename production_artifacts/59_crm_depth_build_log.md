# 59 CRM Depth Build Log

## Summary

Extended the existing client model into a usable CRM profile without replacing existing booking/job/invoice/payment truth.

## Client Model Expansion

Added creator-scoped CRM fields to `clients`:

- phone
- company name
- status baseline
- tags
- notes
- last contacted at

## CRM API Added

- `GET /api/crm/clients`
- `GET /api/crm/clients/:clientId`
- `PATCH /api/crm/clients/:clientId`

## CRM UI Added

- [page.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/app/app/clients/page.tsx)
- [page.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/app/app/clients/[clientId]/page.tsx)
- [clients-workspace.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/src/crm/clients-workspace.tsx)
- [client-profile.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/src/crm/client-profile.tsx)

## Relationship Views

CRM profiles now aggregate:

- linked booking requests
- linked jobs
- linked invoices
- linked payments
- relationship timeline

## Timeline Strategy

- derive core business timeline entries from existing operational/commercial tables
- persist creator-driven CRM events in `client_timeline_events`

## Assumptions

- creator-scoped email dedup remains the canonical client identity rule
- relationship timeline should blend derived events and explicit CRM updates

## Risks

- richer CRM segmentation and workflow automation are still deferred
- no agency/multi-owner client sharing exists yet

## Approval Gates

- approve CRM as an extension of `clients`, not a new entity system
- approve creator-scoped dedup continuing as the baseline
