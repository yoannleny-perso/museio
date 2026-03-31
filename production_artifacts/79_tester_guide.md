# 79 Tester Guide

## Purpose

This guide is for human QA once the real preview deployment is available.

## Current Limitation

A real preview URL was not available during this execution pass, so testers should not begin until the preview environment has:

- a public web URL
- a reachable API URL
- the matching Supabase preview/staging project behind it

## Before Testing

1. Confirm the preview URLs are known.
2. Confirm sign-in works for a creator test account.
3. Confirm the preview environment passed:
   - `pnpm verify:preview-env`
   - `pnpm test:preview-smoke`
4. Confirm no one is testing against a local-only stack by mistake.

## Highest-Value Test Areas

### Public Portfolio

- open a public creator handle
- confirm it looks intentional and contains no edit controls
- confirm empty/disabled sections do not appear in live mode

### Public Booking

- open `/:handle/book`
- confirm availability looks public-safe
- submit a booking request
- confirm private or unavailable creators cannot be booked publicly

### Creator Booking Ops

- sign in as the creator
- open `/app/bookings`
- open the new request
- mark under review
- accept into job draft
- confirm the request history stays intact

### Quotes / Invoices / Payments

- open the converted job
- confirm quote draft visibility and send state
- confirm public quote acceptance works
- confirm invoice draft and send state are visible
- confirm payment status changes appear back in the creator workflow

### Finance

- open `/app/finance`
- confirm receivables, deposits, balances, and overdue states look coherent
- confirm totals reflect invoice/payment truth rather than generic job state

### Messaging

- open `/app/messages`
- confirm thread list renders
- open a thread
- confirm only the correct creator can view it

### Calendar Overlays

- check that busy blocks affect availability
- confirm public booking does not reveal internal conflict details

## What To Flag As A Product Bug

- wrong access control
- wrong commercial state
- wrong finance totals
- broken booking conversion
- hidden internal calendar details appearing publicly
- public/private portfolio mistakes

## What To Flag As Environment / Setup

- preview URL missing
- API unreachable
- preview uses the wrong Supabase project
- machine-local TLS issues caused by `SSL_CERT_FILE`

## Suggested Tester Sequence

1. Public portfolio
2. Public booking
3. Creator booking inbox
4. Job conversion
5. Quote acceptance
6. Invoice payment flow
7. Finance visibility
8. Messaging
9. Calendar conflict sanity

## Exit Criteria

Preview QA is meaningfully complete when:

- public and protected flows are both testable by humans
- no access-control regressions are found
- no money-state regressions are found
- no preview-environment blocker remains open
