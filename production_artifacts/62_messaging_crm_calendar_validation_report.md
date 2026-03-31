# 62 Messaging CRM Calendar Validation Report

## Verification Summary

Phase 7 passed local verification against the active Supabase-backed environment and local Nest API.

## Tooling Checks

- `npm exec -- pnpm lint` passed
- `npm exec -- pnpm typecheck` passed
- `npm exec -- pnpm test` passed
- `npm exec -- pnpm build` passed

## Migration

Applied:

- [20260331000006_coordination_foundations.sql](/Users/yoann/Museio/app_build/museio_app/supabase/migrations/20260331000006_coordination_foundations.sql)

via `psql` against the active local stack.

Note:

- the active local Postgres container was reachable on `127.0.0.1:5432`, not the older `54322` expectation from config, so verification used the live running stack rather than re-provisioning it in this turn

## End-to-End Scenario Verified

One integrated local scenario verified:

- booking request creation
- accepted booking to client + job draft conversion
- quote creation and acceptance
- invoice creation
- webhook-driven payment recording
- messaging thread creation and creator message send
- realtime thread/message updates
- unread/read behavior
- CRM relationship linkage
- calendar account creation
- external busy-block import
- public availability masking

## Verified Outcomes

- creator thread access is owner-scoped
- outsider creator receives `404` on another creator's thread
- realtime subscriptions received:
  - `conversation_threads INSERT`
  - `messages INSERT`
  - `conversation_threads UPDATE`
- CRM relationship summary reconciled:
  - booking requests: `1`
  - jobs: `1`
  - invoices: `1`
  - payments: `1`
  - collected: `198000`
  - outstanding: `0`
- messaging reused the same `clientId` as booking conversion and job linkage
- imported external busy block persisted and appeared in creator conflict center
- public booking availability for the blocked day split into two safe windows:
  - `09:00-12:00`
  - `13:00-17:00`
- public payload did not leak:
  - raw external event title
  - raw source label
  - raw provider status

## Identity Integrity Check

No duplicate identity system was introduced in the verified flow:

- booking request linked to `clientId`
- job draft reused the same `clientId`
- messaging thread reused the same `clientId`
- CRM profile was fetched from that same `clientId`

## Verification Limits

- verification was local-stack based, not hosted-runtime based
- hosted Node trust-store caveat remains relevant for hosted runtime checks on this machine
- no public client-authenticated messaging surface was verified because it was intentionally not added in this phase

## Approval Gates

- approve local verification evidence for messaging, CRM, and calendar foundations
- approve current creator-only messaging surface scope
