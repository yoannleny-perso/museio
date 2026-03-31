==================================================
FEATURE 1 — GST TAXATION + ATO REPORTING TAX CENTRE
==================================================

GOAL
Turn Finance into a real business dashboard for Australian freelancers. Museio must help artists understand GST, collect it properly, and prepare ATO-friendly reporting outputs.

MAIN UX MODEL
Inside Finance, add a new high-priority entry card called Tax Centre. This opens a sub-modal flow or full-screen sub-area depending on depth.

SCREENS TO GENERATE
1. Finance Overview with new Tax Centre card
2. Tax Centre Dashboard
3. GST Setup Wizard
4. Tax Settings modal
5. BAS Report Generator screen
6. Tax Period Detail screen
7. Transaction Classification screen
8. Manual Adjustment modal
9. Export Report modal
10. Empty state for users not registered for GST
11. Warning state for incomplete tax data
12. Success state after BAS export

CORE UI BLOCKS
- GST status banner: Registered / Not Registered / Pending verification
- Tax summary card: GST collected, GST payable, GST-free revenue, taxable revenue, adjustments
- Reporting period selector: monthly / quarterly / annual / custom
- Reconciliation status row: matched, partially matched, missing metadata
- export CTA group: CSV, PDF summary, BAS package
- settings row: ABN, GST registration date, reporting cadence, default tax mode

LOGIC TO VISUALIZE
- user can toggle GST registration on or off
- if GST is off, invoice flows default to no GST
- if GST is on, each line item can be GST inclusive, GST exclusive, GST-free, or out of scope
- tax calculations must show subtotal, GST amount, total, and taxable base
- Finance must show revenue with and without tax
- reports must support cash basis and accrual basis toggles
- tax centre must aggregate from invoices, jobs, and payments
- system should flag suspicious inconsistencies such as invoice marked taxable but missing GST amount

KILLER FEATURES TO ADD
- GST Health Score card showing readiness for BAS submission
- ATO Readiness Checklist with remaining actions
- anomaly panel detecting missing ABN, uncategorized lines, or conflicting GST modes
- quick action to “Fix 12 unclassified transactions”
- smart monthly insight card: “You collected $X GST this quarter; set aside Y in your tax wallet”
- downloadable BAS summary cover sheet designed like a clean accountant handoff
- optional tax reserve tracker showing how much of cash balance should be reserved for GST liabilities

INTERACTIONS
- tapping a tax summary opens drill-down details
- tapping a flagged transaction opens classification editor
- export sheet lets user choose period, export type, accounting basis, and inclusion rules
- dashboard should support empty, partial, and fully-configured states

COMPONENTS TO CREATE
- Tax metric card
- Tax status banner
- Period filter chip group
- Report export row
- Classification pill: Taxable / GST-free / Out of scope / Needs review
- Reconciliation badge: Synced / Partial / Manual
- BAS checklist row with completion state

==================================================
FEATURE 2 — GOOGLE CALENDAR / GMAIL + CALENDLY INTEGRATION
==================================================

GOAL
Make Museio the source of truth for artist availability by overlaying external events from Google Calendar and Calendly on top of internal availability.

MAIN UX MODEL
Add Connected Calendars under More. Also surface connection health in Availability and public booking-related settings.

SCREENS TO GENERATE
1. Connected Calendars hub screen
2. Connect Google account flow
3. Connect Calendly flow
4. Calendar Permissions explainer screen
5. Sync status dashboard
6. Calendar source settings modal
7. Conflict review screen
8. Availability overlay preview screen
9. External event details bottom sheet
10. Sync error state
11. Disconnected account state
12. First successful sync success state

CORE UI BLOCKS
- connected account cards
- source badges: Internal, Google Calendar, Calendly
- sync status labels: active, refreshing, stale, permission error, disconnected
- event block legend using colors and pattern fills
- merge rules panel
- conflict alert banner
- “block public booking from this event” toggle
- “ignore this external event” action

LOGIC TO VISUALIZE
- availability should combine internal weekly schedule, vacations, internal jobs, pending requests, Google events, and Calendly bookings
- external blocks should be shown as overlays in calendar and availability previews
- user can choose which calendars count as blocking calendars
- user can choose whether tentative events block time
- duplicate event detection should avoid double-blocking
- stale sync warning should appear if last sync exceeds a threshold
- if permissions are revoked, public booking should fail safe and temporarily hide exposed slots if safe mode is enabled

KILLER FEATURES TO ADD
- smart conflict center suggesting alternative time windows when overlap is detected
- confidence indicator for sync freshness
- one-tap “backfill last 30 days and next 180 days” option
- preview mode showing exactly how public booking availability will look after sync rules
- event privacy masking: personal event titles shown privately to artist, but public booking only sees blocked time
- time source timeline on a date: internal job, Google meeting, Calendly event, vacation, manual block

INTERACTIONS
- account card opens source settings
- sync banner opens issue detail and recovery actions
- availability preview can toggle layers on/off
- conflict review lets user keep Museio event, keep external event, or split availability

COMPONENTS TO CREATE
- connected source card
- sync badge
- event source pill
- calendar legend item
- conflict row with resolution CTA
- layer toggle chips
- freshness meter

==================================================
FEATURE 3 — MULTIPLE SLOTS FOR BOOKING
==================================================

GOAL
Support residencies, tours, repeat bookings, multi-day packages, and clients who need multiple date/time blocks in one request.

MAIN UX MODEL
Extend the public booking flow so clients can book a single slot or multiple slots within one booking package.

SCREENS TO GENERATE
1. Booking Flow Step 1A: booking mode selection (single date / multiple dates / residency package)
2. Booking Flow Step 1B: multi-date calendar selection
3. Booking Flow Step 2A: per-date time picker
4. Booking Flow Step 2B: bulk apply time range modal
5. Booking Flow Step 2C: slot review and edit screen
6. Booking Flow Step 3: contact details
7. Booking Flow Step 4: event details and package details
8. Booking Flow Step 5: package confirmation summary
9. Partial availability warning state
10. Fully unavailable package state
11. Artist-side booking request detail for multi-slot requests
12. Quote builder for multi-slot requests
13. Consolidated invoice preview for multi-slot package

CORE UI BLOCKS
- slot chip list
- selected date counter
- slot card with date, start, end, duration, status
- package summary sidebar card
- conflict badge per slot
- “apply to all dates” control
- “add another slot” CTA
- price estimate preview block

LOGIC TO VISUALIZE
- booking request can contain an array of slot blocks
- each slot must pass availability rules independently
- if some slots fail, show which are unavailable and let client revise only those
- artist receives one consolidated request with a package summary
- artist can quote all slots together or edit per-slot pricing
- invoicing should support combined total while still showing slot-level line items
- public booking confirmation should clearly show how many dates are requested

KILLER FEATURES TO ADD
- residency template presets: weekly Friday residency, weekend series, monthly recurring set
- package-level discount suggestions
- heatmap preview to help clients find clusters of available dates faster
- slot summary card with travel/load-in notes per date
- package confidence meter: all slots confirmed, some provisional, needs artist review

INTERACTIONS
- switching from single to multi-slot preserves eligible fields where possible
- selecting dates opens a batch time assignment option
- package review screen allows deleting or editing individual slots
- artist-side quote builder can collapse/expand slot details

COMPONENTS TO CREATE
- multi-date selector
- slot card
- bulk action toolbar
- package summary card
- slot conflict pill
- schedule matrix mini-preview

==================================================
FEATURE 4 — INVOICE ATTACHMENTS
==================================================

GOAL
Allow artists to send attachments with invoices such as receipts, stage plots, tech riders, contracts, hospitality riders, and supporting documents.

MAIN UX MODEL
Extend invoice composer and invoice preview with an Attachments section.

SCREENS TO GENERATE
1. Invoice Composer with attachments module
2. Attachment upload modal
3. Attachment list manager bottom sheet
4. File preview modal for image/PDF
5. Email preview with attachments section
6. Upload progress state
7. Unsupported file error state
8. File too large state
9. Remove attachment confirmation modal
10. Client invoice email success confirmation
11. Public invoice view attachment list

CORE UI BLOCKS
- attachment rows with file icon, filename, size, type, and remove action
- upload dropzone / picker state for mobile
- attachment badges: PDF, image, doc, receipt, rider
- “included in email” toggle
- secure access note

LOGIC TO VISUALIZE
- artist can attach multiple files before sending invoice
- system validates size, file type, and max attachment count
- artist can rename display labels before sending
- client sees a clean attachment list in invoice email and public invoice view
- attachments can be optional or required for certain invoice templates
- invoice resend flow keeps prior attachments unless removed

KILLER FEATURES TO ADD
- auto-tagging of attachment type: receipt, contract, stage plot, tech spec
- attachment cover thumbnails for images and PDFs
- “attach from job files” quick picker
- “attach proof of deposit” on balance reminder flows
- smart recommendation: “This job includes a stage plot on file — include it?”

COMPONENTS TO CREATE
- attachment row
- attachment uploader
- upload progress bar
- file-type chip
- inline attachment preview card

==================================================
FEATURE 5 — IN-APP CHAT
==================================================

GOAL
Centralize negotiation, logistics, and event communication inside Museio instead of scattered Instagram and WhatsApp messages.

MAIN UX MODEL
Add Messages as a destination from More, but also deeply integrate chat into Job Detail and Client Detail. Make chat feel like a professional thread tied to the commercial record.

SCREENS TO GENERATE
1. Messages Inbox screen
2. Conversation Thread screen
3. Job Detail with Chat tab
4. Client Detail with Chat entry point
5. New Conversation modal
6. Composer expanded state
7. Empty inbox state
8. No messages yet state inside job
9. Attachment placeholder state for future extensibility
10. Unread filter state
11. Search results state
12. Push notification deep-link destination
13. Permission/identity state for client web chat access
14. Message failed to send state
15. Offline cached thread state

CORE UI BLOCKS
- conversation row with avatar, name, job tag, last message, unread count, timestamp
- message bubbles for artist, client, and system messages
- system timeline message cards for quote sent, deposit paid, invoice viewed, slot changed
- quick reply chips
- message composer with text field, emoji, future attachment slot, send button
- unread divider
- typing indicator
- connection status banner

LOGIC TO VISUALIZE
- conversations can be linked to a job, a booking request, or a client record
- system events should appear inline in the thread
- unread counts appear in inbox and relevant job/client locations
- search works by client name, job title, venue, and message content
- notifications open the exact thread and scroll to latest unread
- conversation permission states vary for artist, signed-in client, and tokenized guest access

KILLER FEATURES TO ADD
- AI thread summary card: “Here is the current agreement”
- pin important logistics like address, load-in time, tech rider, payment terms
- one-tap convert message details into job notes
- smart suggested replies based on workflow context
- internal reminders extracted from chat, like “Follow up on deposit Friday”
- milestone cards for key workflow moments, such as quote accepted or balance overdue

INTERACTIONS
- opening a job with unread messages lands on Chat tab if deep-linked from notification
- composer can insert quick templates: confirmation, request missing info, send bank details, ask for stage plot
- system messages are visually distinct and not editable

COMPONENTS TO CREATE
- conversation row
- unread badge
- message bubble set
- system event card
- quick reply chip
- chat composer
- typing indicator
- connection banner

==================================================
FEATURE 6 — SHAREABLE JOB CARDS FOR WHATSAPP + INSTAGRAM DM
==================================================

GOAL
Let artists share polished, tokenized links to quotes, invoices, and job summaries in social channels with strong branded previews.

MAIN UX MODEL
Add a Share Job Card action from Job Detail, Quote Review, and Invoice screens.

SCREENS TO GENERATE
1. Share Job Card modal
2. Job Card style selector
3. Share channel picker
4. Public Job Card web view
5. Public Quote Card web view
6. Public Invoice Card web view
7. Link access expired state
8. Link access unauthorized state
9. Link already used state where applicable
10. Share success toast and confirmation sheet

CORE UI BLOCKS
- preview card canvas
- brand preview frame with artist image, event name, date, venue, amount, status, CTA
- secure link settings rows
- channel shortcuts: WhatsApp, Instagram DM, copy link, email
- expiry and permission chips
- tokenized access note

LOGIC TO VISUALIZE
- links can point to job summary, quote acceptance, or invoice payment view
- preview must show secure but non-sensitive metadata
- links can expire or be revoked
- used-one-time quote actions must show correct locked state after action is taken
- artists can regenerate link or copy a new one

KILLER FEATURES TO ADD
- Open Graph preview designer with 2 or 3 branded layout variants
- “share with confidence” security note explaining what the client can see
- quick toggles: hide price, show deposit only, show due date, show artist avatar
- dynamic social-ready preview image
- share tracking mini-insights: viewed, clicked, completed

COMPONENTS TO CREATE
- share action sheet
- preview canvas card
- share channel button row
- security chip
- token status banner

==================================================
FEATURE 7 — DEPOSIT PAYMENTS
==================================================

GOAL
Protect artists from flaky bookings by supporting deposits and balance collection.

MAIN UX MODEL
Deposits should be configurable during quote/invoice creation and visible throughout Jobs and Finance.

SCREENS TO GENERATE
1. Deposit setup modal in quote/invoice flow
2. Deposit amount selector (percentage / fixed amount)
3. Deposit due-date picker
4. Job detail with deposit status card
5. Public deposit payment view
6. Deposit paid success state
7. Balance remaining summary card
8. Balance invoice composer
9. Finance Deposits dashboard
10. Overdue deposit reminder modal
11. Deposit policy settings screen
12. Partial deposit exception state

CORE UI BLOCKS
- deposit amount calculator
- payment split summary card: deposit due now, balance later
- status timeline: quote sent, deposit requested, deposit paid, balance due, fully paid
- reminders row
- deposit protection banner

LOGIC TO VISUALIZE
- quote or invoice can request a deposit instead of full payment
- deposit can be a fixed fee or percentage
- deposit payment confirms the booking commercially and moves status to deposit-paid
- balance remains pending until final invoice is paid
- artist can resend deposit request or convert remaining balance into final invoice
- finance dashboard separates deposits received from full payments

KILLER FEATURES TO ADD
- default deposit templates by event type
- suggested deposit percentages based on event size/risk
- automatic balance invoice scheduling based on event date
- client trust copy explaining why deposits are required
- payment plan explainer for transparency

COMPONENTS TO CREATE
- deposit calculator card
- balance timeline
- payment phase badge
- deposit reminder row
- deposit summary pill group

==================================================
FEATURE 8 — SPLIT PAYMENTS
==================================================

GOAL
Support multi-party payouts such as platform fee, promoter share, agency share, and artist net payout.

MAIN UX MODEL
Add split payment setup at job/payment level, with simple and advanced modes.

SCREENS TO GENERATE
1. Split Payment setup modal
2. Beneficiary list screen
3. Add beneficiary modal
4. Payout summary screen
5. Job detail payout breakdown card
6. Finance Payouts dashboard
7. Stripe-linked beneficiary state
8. Invalid payout setup error state
9. Payment completion with split summary
10. Audit trail screen for payouts

CORE UI BLOCKS
- beneficiary rows with role, account status, percentage/fixed amount, expected payout
- payout waterfall diagram
- platform fee badge
- validation banner if total split exceeds 100 percent or breaks minimums
- payout timeline card

LOGIC TO VISUALIZE
- split rules can include Museio fee, promoter cut, agent cut, and artist net
- split setup can be per-job or from reusable templates
- payout setup requires valid linked accounts where necessary
- Finance should clearly show gross collected, platform fee, third-party share, and artist net
- if split configuration is incomplete, payment sending should surface a blocking warning

KILLER FEATURES TO ADD
- split templates for promoter deal, agency representation, venue residency
- before-send simulation showing everyone’s expected payout
- audit trail of payout logic used at payment time
- transparency card that the artist can share internally with collaborators

COMPONENTS TO CREATE
- beneficiary row
- split waterfall diagram
- payout validation banner
- template card
- audit event row

==================================================
CROSS-FEATURE IMPROVEMENTS YOU MUST ALSO DESIGN
==================================================

1. FINANCE TAB RESTRUCTURE
Redesign Finance into four clear sub-areas:
- Overview
- Tax Centre
- Deposits & Payouts
- Reports

Include:
- top segmented header or sub-tab navigation
- stronger information hierarchy
- month/quarter filters
- cards for earnings, forecast, GST, deposits, overdue balances, payouts
- export shortcuts

2. JOB DETAIL REDESIGN
Expand Job Detail into a richer hub with tabs or sections for:
- Summary
- Quote / Invoice
- Payments
- Chat
- Files
- Share
- Timeline

3. CLIENT DETAIL REDESIGN
Turn Client detail into a mini CRM:
- profile and contact details
- linked jobs
- linked conversations
- outstanding balances
- notes and logistics

4. AVAILABILITY UX IMPROVEMENT
Make Availability easier to reason about:
- layers for internal schedule, external calendars, vacations, jobs, requests
- block legend
- conflict explanation
- public preview mode

5. PROTOTYPED WEB VIEWS
Generate web/mobile-web frames for:
- public multi-slot booking
- quote card view
- invoice card view
- deposit payment page
- balance payment page
- expired link state

==================================================
SCREEN STATE MATRIX — EACH OF THESE MUST EXIST WHERE RELEVANT
==================================================

For every new feature, include states for:
- empty
- loading / skeleton
- first-use onboarding
- permission required
- validation error
- API / sync failure
- partial success
- full success
- revoked / expired / disconnected
- offline / stale data
- destructive confirmation

==================================================
COMPONENT LIBRARY EXPANSION
==================================================

Create or extend these components with variants:
- app header
- bottom tab bar
- secondary segmented control
- info banner
- status chip
- finance metric card
- report row
- date range picker
- calendar layer legend
- source account card
- slot card
- package summary card
- attachment row
- chat bubble
- system timeline item
- share preview card
- deposit calculator
- payout split row
- validation banner
- empty state module
- success confirmation module

Each component must include variants for:
- default
- hover if web relevant
- pressed
- disabled
- loading
- error
- selected or active
- completed where applicable

==================================================
PROTOTYPE FLOWS TO BUILD
==================================================

Create clickable prototype flows for all of these:
1. Artist connects Google Calendar and sees external blocks in Availability
2. Client books a 4-date residency package
3. Artist reviews multi-slot request and sends one consolidated quote
4. Client accepts quote and pays deposit
5. Artist sees deposit-paid status and schedules final balance invoice
6. Artist adds attachments to invoice and previews outbound email
7. Artist opens Finance > Tax Centre and exports a quarterly BAS package
8. Artist shares a Job Card via WhatsApp link
9. Client opens share link and sees secure branded quote/invoice web card
10. Artist and client exchange messages in job-linked chat
11. Artist configures split payment and previews payout breakdown
12. Payment completes and Finance updates tax, payout, and status views

==================================================
COPYWRITING TONE
==================================================

Use product copy that feels:
- premium but not corporate
- supportive and clear
- operationally trustworthy
- friendly to creators who are not accountants

Examples:
- “Stay on top of GST without spreadsheet chaos.”
- “Your calendar is now protecting public booking slots.”
- “Deposit received — this booking is now commercially confirmed.”
- “Share a polished booking card in any DM.”

==================================================
ACCESSIBILITY + USABILITY RULES
==================================================

- maintain 44px minimum touch targets
- improve text contrast versus V1
- never rely on color alone for payment or tax states
- use explicit labels and icons together for status
- use concise helper text for tax and payout education
- multi-slot selection must be understandable without training
- chat and finance screens should feel denser and more efficient than portfolio editing screens

==================================================
VISUAL SPEC FOR NEW FEATURES
==================================================

Use the existing Museio visual language, but refine it:
- keep lavender and purple as brand anchors
- introduce clearer semantic colors for success, warning, info, tax, deposit, overdue, and sync state
- use white / tinted cards with stronger structure
- use timeline and operational widgets that feel reliable and more “fintech” where needed
- reserve gradients for hero CTAs, not every action

==================================================
FIGMA PAGE STRUCTURE TO OUTPUT
==================================================

Page 01 — Cover / Release Notes V2
Page 02 — Foundations / Tokens
Page 03 — Semantic Colors / Status System
Page 04 — Components / Navigation
Page 05 — Components / Forms + Finance
Page 06 — Components / Messaging + Sharing
Page 07 — Components / Payments + Tax
Page 08 — Components / Availability + Booking
Page 09 — Flow / Finance and Tax
Page 10 — Flow / Connected Calendars
Page 11 — Flow / Booking Packages
Page 12 — Flow / Invoices and Attachments
Page 13 — Flow / Chat
Page 14 — Flow / Deposits and Split Payments
Page 15 — App Screens / Authenticated Mobile
Page 16 — Public Web Views / Booking + Quote + Invoice
Page 17 — Edge Cases and Failure States
Page 18 — Logic Notes / Data Model + State Transitions

==================================================
FINAL INSTRUCTION TO FIGMA
==================================================

Update the existing Museio file so V2 feels like a real product release, not a disconnected set of feature mocks. Every new feature must:
- fit the current Museio IA
- feel visually consistent with Museio
- solve the operational workflow end to end
- include realistic content and real business states
- be clickable in prototype mode
- reuse components and tokens properly
- clearly differentiate artist-side and client-side experiences

Do not skip any screens because they feel “too technical.” Technical workflows such as tax setup, deposit logic, split payout validation, sync errors, and link expiry are core product moments and must be fully designed.

OUTPUT STANDARD
Generate complete, high-fidelity mobile frames and companion web views where required. Include all primary, secondary, and edge-state screens. Ensure the file is organized so a product team could directly review flows, test interactions, and hand the designs to engineering without ambiguity.