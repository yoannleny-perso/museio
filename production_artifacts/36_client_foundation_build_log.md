# 36 Client Foundation Build Log

## Summary

Added the first durable client persistence layer and linked it to accepted booking requests.

## What Was Added

- `clients` table with creator ownership, normalized email, and source booking linkage
- shared `ClientRecord` contract
- validation schema for client records
- server-side client dedup logic in the booking service

## Dedup Rule

- unique scope: `creator_user_id + primary_email_normalized`

This keeps dedup creator-owned and avoids cross-creator data leakage.

## Booking Linkage Behavior

- booking requests preserve the original requester snapshot
- accepted requests can link to a client
- repeated accepted requests from the same requester email under the same creator reuse the existing client record

## Assumptions

- Email is the safest initial dedup key for a creator-scoped client foundation.
- A source booking request can seed the first client record without becoming the client’s only source of truth long term.

## Risks

- No richer client profiles, tags, addresses, or contact methods yet
- No merge UI yet for ambiguous client duplicates

## Approval Gates

- Approve creator-scoped email dedup for V1 client linkage.
- Approve deferring full CRM depth while keeping the client record durable.
