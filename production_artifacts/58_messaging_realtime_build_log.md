# 58 Messaging Realtime Build Log

## Summary

Implemented durable messaging persistence, API orchestration, protected web UI, and realtime subscriptions.

## Persistence Added

- `conversation_threads`
- `conversation_thread_participants`
- `messages`
- `message_read_states`

## API Added

- `GET /api/messages`
- `GET /api/messages/:threadId`
- `POST /api/messages/threads`
- `POST /api/messages/threads/:threadId/messages`
- `POST /api/messages/threads/:threadId/read`

## Web Surfaces Added

- [page.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/app/app/messages/page.tsx)
- [page.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/app/app/messages/[threadId]/page.tsx)
- [messages-workspace.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/src/messaging/messages-workspace.tsx)
- [message-thread-detail.tsx](/Users/yoann/Museio/app_build/museio_app/apps/web/src/messaging/message-thread-detail.tsx)

## Realtime Approach

- Supabase Postgres Changes subscriptions on:
  - `conversation_threads`
  - `messages`
- subscriptions refresh server-owned state rather than performing optimistic client reconciliation

## Read/Unread Behavior

- creator read-state is stored in `message_read_states`
- creator-authored messages auto-mark the thread as read for the creator
- client-originated messages increment creator unread count until explicitly marked read

## Assumptions

- creator-side realtime is sufficient for this phase
- public/client reply UI can be added later on top of the current participant and read-state model

## Risks

- if realtime publication config drifts, thread/message live updates would degrade to refresh-only behavior
- there is no offline queueing or message retry depth yet

## Approval Gates

- approve thread/message persistence model
- approve realtime refresh strategy
- approve creator-only messaging UI scope
