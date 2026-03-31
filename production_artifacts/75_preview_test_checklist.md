# 75 Preview Test Checklist

## Environment Sanity

- confirm preview web root loads
- confirm preview API `/health` returns `200`
- confirm preview sign-in page loads
- confirm preview Supabase project matches the API runtime project
- confirm no runner or shell is silently forcing a bad `SSL_CERT_FILE`

## Public Portfolio

- load a public handle page and confirm it renders without edit controls
- confirm private handle returns the intentional unavailable/not-found behavior
- confirm canonical public presentation still looks share-ready on desktop and mobile widths

## Public Booking

- open `/:handle/book` for a public portfolio
- confirm public-safe availability is shown without raw internal conflict detail
- submit a booking request and confirm success state
- confirm private or unavailable booking routes do not accept submission

## Creator Booking Ops

- sign in from the preview sign-in flow
- confirm `/app/bookings` redirects to sign-in when unauthenticated
- confirm the creator inbox shows the new request
- open the request detail and confirm review actions are available
- accept a request and confirm a job draft is created exactly once

## Quotes, Invoices, Payments

- open the accepted job detail
- confirm quote draft visibility and send-state visibility
- confirm invoice draft visibility and send-state visibility
- confirm public quote acceptance route works only with a valid token
- confirm public invoice payment route works only with a valid token
- confirm webhook-driven paid-state updates reconcile back into the creator side

## Finance

- open `/app/finance`
- confirm finance totals render from invoice/payment truth
- confirm deposits and balances are visible in the receivables surfaces
- confirm overdue logic is invoice-driven rather than job-driven

## Messaging

- open `/app/messages`
- confirm the thread list renders
- open a thread detail and confirm creator-only access
- confirm unread/read behavior updates cleanly

## Calendar Overlays

- confirm imported busy blocks appear in creator conflict surfaces
- confirm public booking slot exposure does not leak internal busy-block titles or source metadata

## Release Gate Sanity

- run `pnpm lint`
- run `pnpm typecheck`
- run `pnpm test`
- run `pnpm build`
- run `pnpm test:system-smoke`
- note that `pnpm format:check` is still tracked as hygiene debt, not a preview blocker
