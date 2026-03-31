# 45 Stripe Payment Orchestration Build Log

## Summary

Phase 5 established Stripe Connect orchestration as the commercial payment backbone while keeping final money-state server-owned.

## What Was Implemented

- Stripe SDK installed in `apps/api`
- API env parsing extended for `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- Nest bootstrap configured with `rawBody: true` for webhook verification
- creator Stripe readiness routes:
  - `GET /api/commercial/stripe/readiness`
  - `PUT /api/commercial/stripe/account`
- public payment session route:
  - `POST /api/commercial/public/invoices/:token/payment-session`
- webhook route:
  - `POST /api/commercial/stripe/webhook`

## Connect Model

- creator stores one connected account state in `stripe_connected_accounts`
- readiness is normalized to:
  - `not-connected`
  - `requires-onboarding`
  - `ready`
- payment collection requires a ready connected account

## Payment Flow

- creator syncs Stripe account readiness
- public invoice token requests a payment phase
- API creates a durable `payment_records` row first
- API creates a Stripe Checkout session or local mock session
- webhook updates payment record status
- webhook refreshes invoice money state and invoice status

## Local Verification Mode

- `sk_test_placeholder` keeps the API in explicit Stripe mock mode
- `acct_ready_demo` simulates a ready connected account
- mock webhook signatures use `STRIPE_WEBHOOK_SECRET`
- this allowed full local verification without faking final paid-state in the client

## Important Rule

The client never marks an invoice as paid. The webhook does.

## Remaining Stripe Gaps

- no live hosted Stripe smoke test was performed in this phase
- no onboarding link creation flow yet
- no refund/dispute handling yet
- no payout/split orchestration yet

## Approval Gates

- Stripe Connect as the long-term backbone
- webhook-owned final payment truth
- mock-mode strategy for local verification
