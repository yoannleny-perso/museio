# 57 Messaging Domain Plan

## Objective

Phase 7 adds creator-client coordination threads without introducing a parallel identity system.

## Source-of-Truth Ownership

- thread ownership is creator-scoped
- client linkage reuses `clients.id`
- linked context reuses existing entity ids:
  - booking request
  - job
  - invoice
  - client
- message persistence is server-owned
- unread/read state is server-owned
- realtime is a transport layer over persisted thread/message truth, not a separate state system

## Shared Contracts Added

- `ConversationThreadRecord`
- `ConversationParticipant`
- `MessageRecord`
- `MessageReadState`
- `LinkedEntityContext`
- `CreatorMessagingState`
- `ConversationThreadDetailState`
- `CreateConversationThreadInput`
- `CreateMessageInput`
- `MarkThreadReadInput`
- `MessageRealtimeEvent`

## Access Model

- creators may only access their own threads and messages
- clients are modeled as participants through existing CRM identity
- no standalone public messaging surface was introduced in this phase

This keeps coordination tied to known bookings/jobs/invoices instead of inventing a second public communications channel.

## Assumptions

- creator-first messaging is the right initial product surface
- linked entity context is optional but preferred for operational traceability
- creator unread state is the only active read-state path in this phase

## Risks

- future client-authenticated or tokenized reply flows will need careful access design on top of the current participant model
- realtime depends on Supabase publication availability for thread/message tables

## Approval Gates

- approve creator-scoped thread ownership
- approve CRM-linked participant model
- approve no public client messaging surface in this phase
