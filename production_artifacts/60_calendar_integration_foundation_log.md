# 60 Calendar Integration Foundation Log

## Summary

Implemented the first external calendar account and imported busy-block foundation without replacing the current availability engine.

## Persistence Added

- `external_calendar_accounts`
- extended `creator_external_calendar_blocks` with:
  - account linkage
  - sync status
  - source metadata
  - imported timestamp

## Shared Contracts Added

- external calendar connection state
- external busy block
- imported conflict source metadata
- sync status
- integration workspace state
- account upsert input
- busy-block import input

## API Added

- `GET /api/calendar`
- `POST /api/calendar/accounts`
- `POST /api/calendar/accounts/:accountId/import-blocks`

## Provider Shape

Current provider model supports:

- `google-calendar`
- `calendly`
- `manual-import`

Google-first shape is supported now, while Calendly remains compatible through the same provider/account/block contracts.

## Assumptions

- manual import is an acceptable provider-safe bootstrap path before OAuth sync depth
- imported busy blocks should be replaceable per account during sync cycles

## Risks

- no background sync scheduler exists yet
- no provider token refresh or OAuth lifecycle exists yet
- imported blocks are foundation-grade, not full calendar event mirroring

## Approval Gates

- approve account/block schema shape
- approve provider abstraction for future Google + Calendly layering
