# 48 Quote Invoice Payment Validation Report

## Verification Summary

Phase 5 passed local commercial verification.

## Baseline Checks

- `pnpm lint` passed
- `pnpm typecheck` passed
- `pnpm test` passed
- `pnpm build` passed
- `supabase db reset --yes` passed with commercial migration `20260331000004_commercial_foundations.sql`
- Nest API booted successfully against local Supabase

## End-To-End Commercial Verification

Verified locally against the running API and local Supabase stack:

- creator user and outsider user created successfully
- public booking intake still resolves through the existing portfolio handle model
- two booking requests accepted into two job drafts
- creator-scoped client dedup linked both requests to one client by email
- outsider could not resolve another creator's commercial job (`404`)
- quote creation from job draft worked
- duplicate quote creation on the same job returned `409`
- quote line item edits persisted and totals recomputed correctly
- quote send produced tokenized public URL
- invalid public quote token returned `404`
- public quote acceptance persisted and moved quote to `accepted`
- invoice creation from accepted quote worked
- duplicate invoice creation on the same job returned `409`
- invoice line item edits persisted and totals recomputed correctly
- deposit invoice send moved invoice to `deposit-requested`
- full-payment invoice send moved invoice to `sent`
- Stripe readiness sync with `acct_ready_demo` returned `ready`
- deposit payment session creation worked
- balance payment session creation worked
- full-payment session creation worked
- webhook-driven completion moved:
  - deposit invoice from `deposit-requested` -> `deposit-paid` -> `paid`
  - full-payment invoice from `sent` -> `paid`
- final payment records were:
  - 2 succeeded records for deposit/balance path
  - 1 succeeded record for full-payment path
- quote and invoice token hashes were stored durably in the database
- commercial jobs index returned the two verified jobs

## Concrete Verified Totals

- deposit-path quote total: `330000` minor units
- deposit-path deposit amount: `99000` minor units
- deposit-path balance amount: `231000` minor units
- full-payment path total: `440000` minor units

## Verification Limits

- hosted Stripe checkout was not exercised
- hosted runtime verification still inherits the previously documented Node trust-store caveat on this machine
- webhook failure, refund, dispute, and void flows were not exercised in this phase

## Result

Phase 5 is locally validated for quote, invoice, deposit, and Stripe mock orchestration behavior.
