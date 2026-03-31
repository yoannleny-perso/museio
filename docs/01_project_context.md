# 01 — Project Context

## Product thesis

Museio is an **artist operating system**.

It combines:
- portfolio and discovery
- public booking
- availability management
- jobs and CRM
- quoting and invoicing
- deposits, payments, and payouts
- finance and tax reporting
- messaging and client logistics

## Reality of the old app

The current Museio app was a **Capacitor-wrapped React SPA** with a **Supabase-heavy backend surface**.

Important truths from the reverse-engineering:
- lots of business logic lived in Supabase edge functions and database-side rules
- the front-end behaved like a thick client
- public booking, quote response, invoice sending, and Stripe flows already existed conceptually
- the app shell used 5 primary tabs: Home, Jobs, Portfolio, Finance, More
- availability and booking logic already existed but had inconsistencies
- Portfolio and Finance were previously under-described and are corrected in `docs/03_portfolio_finance_truth.md`

## What the rebuild should preserve

- the product's artist-first operational value
- the mobile-first shell
- the public portfolio + booking connection
- Supabase compatibility where it speeds migration and preserves data contracts
- existing public and private domain concepts: user, client, booking request, job, invoice, payment, availability, portfolio

## What the rebuild should replace

- business logic hidden in random client components
- brittle routing and deep-link shortcuts
- timer-based refresh hacks
- dangerous delete semantics in Portfolio
- approximate finance logic using weak proxies
- generic Stripe shortcuts instead of product-native flows
- sparse, under-guided builder experiences

## Design direction

Museio should have **two visual languages**:

### Operational app surfaces
- clear
- reliable
- efficient
- touch-first
- clean SaaS quality

### Portfolio and public surfaces
- premium
- editorial
- dynamic
- motion-rich
- conversion-oriented
- visually closer to best-in-class creator tools

The creator editing environment should sit between both worlds.

## Migration stance

Use the Figma-generated code as the **visual seed**, not as the architecture.

Use the old reverse-engineered findings as **domain truth**, not as a mandate to keep old implementation mistakes.

## Build outcome

The new app must feel like:
- an operating system for artists on the inside
- a premium mini-site builder in the middle
- a trusted booking and money platform on the outside
