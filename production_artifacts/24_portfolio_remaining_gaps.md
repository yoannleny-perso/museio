# 24 Portfolio Remaining Gaps

## Blocking Or High-Importance Gaps

- Hosted Supabase is not migrated yet.
- `SUPABASE_DB_PASSWORD` is still required to apply the schema to the hosted project through a normal workflow.
- The current local Supabase CLI workflow does not correctly discover the repo’s `infra/supabase` migration layout during `db reset`.

## Product Gaps Still Intentionally Deferred

- mobile Portfolio CRUD UI
- drag-and-drop section ordering
- collection item reordering
- richer starter templates
- dynamic OG/social image generation
- custom SEO controls
- booking flow implementation behind Book Me
- Finance, Messaging, CRM, Payments, Invoicing, Tax, Deposits

## Technical Risks

- signed media URLs are generated at request time; future caching/CDN strategy is still open
- collection create + optional image upload is not transactional across database and storage
- `accountId` currently falls back to the auth user id when richer tenant metadata is absent
- the editor is functionally verified through API/runtime checks, but not yet covered by browser automation

## Future Architecture Notes

- Booking should reuse the current public Portfolio handle resolution and server-owned visibility model rather than inventing a parallel public identity system.
- Finance should continue to treat the client as a thin shell and keep any payout, tax, or balance truth in server-owned orchestration contracts, not in Portfolio-facing clients.

## Recommended Next Approval Gate

Approve the next phase only after:

- hosted Supabase migration credentials are provided
- the hosted project schema is applied
- the local Supabase CLI path issue is either fixed or intentionally accepted as a temporary repo quirk
