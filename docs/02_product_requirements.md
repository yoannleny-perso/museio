# 02 — Product Requirements

## Core user roles

### Artist
The primary authenticated user who configures their profile, availability, portfolio, jobs, invoices, and finance.

### Client
A promoter, venue, brand, agency, or event organizer who may submit booking requests, review quotes, chat, and pay.

### Platform admin
Optional internal role for support, abuse management, diagnostics, and configuration.

---

## Page inventory

### Authenticated app
- Splash / Loading
- Auth
- Home dashboard
- Jobs list
- Jobs detail
- New job / edit job flow
- Requests inbox
- Clients list and detail
- Availability settings
- Vacation / blackout periods
- Portfolio overview
- Portfolio builder
- Theme Studio
- Content Studio
- Preview / publish flow
- Portfolio insights
- Finance overview
- Tax Centre
- Tax report detail
- Deposits & payouts
- Stripe connection and payout setup
- Messages inbox
- Job-linked chat
- Connected calendars
- Settings
  - Profile
  - Username
  - Invoice settings
  - Signature
  - Bank details
  - Tax settings
  - Notification settings

### Public surfaces
- Public portfolio at `/:handle`
- Public booking flow
- Public quote response view
- Public invoice / payment view
- Shareable Job Card view

### Modals / bottom sheets
- Add section
- Reorder sections
- Theme picker
- Palette selector
- Image/video upload
- Edit bio
- Book Me CTA config
- Multi-slot picker
- Quote accept / decline
- Invoice attachments
- Deposit setup
- Split payment setup
- Tax export
- Calendar conflict details
- Share actions

---

## Feature requirements by domain

### 1. Auth and setup
- email / password or OAuth sign-in
- protected app shell
- setup gating for missing profile requirements
- publishing blocked until username exists
- financial operations blocked until payout setup and signature/settings are complete where required

### 2. Portfolio builder
- thumb-first editor
- live preview
- public/private toggle
- starter templates
- add/edit/reorder/toggle sections
- safe delete by section instance
- theme presets and deep theme controls
- analytics for visits and CTA taps
- booking CTA integrated into portfolio

### 3. Public portfolio
- premium public page
- empty-section hiding
- sticky booking CTA where appropriate
- media lightbox and carousels
- fast trust signals: response expectations, social proof, verified states, availability teaser, testimonials

### 4. Availability
- weekly recurring rules
- vacation periods
- minimum notice and buffer rules
- internal jobs block time
- booking requests block tentative time where product rules require it
- Google Calendar overlay
- Calendly overlay
- conflict center for disputed or overlapping blocks

### 5. Public booking
- basic inquiry flow
- multi-slot booking for residencies / multi-day bookings
- slot summary and package review
- validation and conflict feedback
- downstream quote creation capability

### 6. Jobs and CRM
- request inbox
- request review
- quote send / decline
- accepted quote -> job creation
- job items
- clients
- timeline and notes
- job-linked chat
- shareable Job Card

### 7. Invoicing, deposits, split payouts
- invoice composer
- line items and tax modes
- invoice attachments
- deposit amount or percentage
- balance invoice generation
- Stripe Connect payment collection
- webhook-driven payment states
- split payouts for platform / agency / artist distributions

### 8. Finance and tax
- earnings overview
- forecast
- invoice aging and status
- deposits and balances
- payout visibility
- GST settings
- GST collection and reporting
- BAS exportable summaries
- tax reserve tracker
- ATO readiness checklist

### 9. Chat and notifications
- realtime messaging
- unread states
- push notifications
- job-linked threads
- message actions, timestamps, system messages

### 10. Sharing and public links
- portfolio share
- quote / invoice links
- Open Graph Job Card links
- secure signed actions where sensitive

---

## Product quality expectations

- mobile-first on every core flow
- beautiful but fast public surfaces
- trustworthy money flows
- no silent logic drift between quote, job, invoice, deposit, payment, and payout semantics
- all critical states visible in UI
- error, loading, offline, permission-denied, and empty states designed and implemented
