# 03 — Portfolio and Finance Truth

This file corrects earlier high-level assumptions.

It is the required truth source for rebuilding **Portfolio** and **Finance**.

---

# A. Portfolio — corrected as-is truth

## A.1 Route model
There are two distinct experiences:
- **Edit mode**: `/app/portfolio`
- **Public live mode**: `/:handle`

The authenticated Portfolio screen is not just a preview. It is a builder/editor.
The public route is the client-facing live page.

## A.2 Edit-mode UX
The in-app Portfolio is a narrow, card-like, thumb-friendly builder rather than a dashboard grid.

Observed characteristics from code analysis:
- app header chrome exists in authenticated mode
- Public / Private toggle exists
- a Live badge and Share action may appear when published
- single centered portfolio card composition
- rounded corners, shadow-heavy treatment, gradient and theme support
- scrollable stacked sections inside a mobile-width showcase page

## A.3 Live-mode UX
The public live view:
- has no app chrome
- has no edit controls
- hides empty sections
- only shows public content
- launches booking via the portfolio experience rather than leaving the context

If portfolio visibility or username resolution fails, the user sees a not-found / not-available state.

## A.4 Data model truth
Portfolio is a hybrid CMS.

### Orchestration object
`portfolio_settings` controls:
- artist name
- bio fields
- profile image references
- gradients and theme choices
- layout choices
- social links
- section order
- enabled sections
- section titles
- section configs
- public/live flags

### Content collections
Actual section content lives in separate collections such as:
- `portfolio_photos`
- `portfolio_videos`
- `portfolio_featured_cards`
- `portfolio_music_releases`
- `portfolio_events`

Implication for rebuild:
- page structure and page content must be separated cleanly
- deleting one section instance must not wipe all data of that content type

## A.5 Theme truth
The old code already had theme and gradient concepts, including multiple soft and dark presets.
The rebuild should expand this into a full **Theme Studio** rather than flattening it to a few colors.

## A.6 Core section structure
The existing system conceptually supports these section families:
- Hero
- Bio
- Featured Cards
- Videos
- Photos
- Music Releases
- Events / Next Shows
- Book Me
- plus custom section instances for similar block types

## A.7 Hero behavior
The hero contains:
- portrait image
- artist name
- short bio
- expandable full bio
- social links
- section navigation

### Important behaviors
- portrait is a 4:5 block
- edit mode can show upload prompts and edit/delete affordances
- short bio and full bio are distinct fields with separate states
- empty fields show edit prompts in authenticated mode

## A.8 Section navigation truth
There is dynamic horizontal section navigation.
It is built from:
- section order
- enabled sections
- optional visibility logic
- content presence in live mode

Behavior to preserve:
- horizontally scrollable tabs
- smooth scroll to section
- active tab changes with viewport intersection

## A.9 Section-specific truth

### Featured Cards
The old implementation suggests a multi-card block, but effectively renders only the **first enabled card** in practice.
Rebuild this as a proper multi-card editorial block.

### Videos
Video embedding and carousel behavior exist, but section scoping is weaker than ideal.
Rebuild with clear per-section ownership.

### Photos
Photos are among the most complete old sections:
- grid when small count
- carousel when larger count
- fullscreen lightbox
- drag reorder in edit mode

### Music Releases
Release cards support multiple streaming links and carousel presentation.

### Events / Next Shows
Upcoming events support flyer, metadata, and ticket link behavior.

### Book Me
This is conversion-critical.
In live mode, it launches the actual booking flow.
In edit mode, it behaves more like a config placeholder.

Rebuild requirement:
Book Me must feel native to the portfolio rather than like a bolt-on form.

## A.10 Publishing truth
Publishing depends on username / handle readiness.
Public share behavior in the old app had environment-specific issues and preview-domain leakage.
The rebuild must use a clean canonical URL contract.

## A.11 Dangerous legacy problems that must not be copied
1. Deleting some custom section instances could wipe all content of that type.
2. New portfolios started too empty.
3. Featured Cards were effectively underpowered.
4. Social links appeared redundantly in multiple places.
5. Share URLs were environment-fragile.

## A.12 Rebuild requirements
The new Portfolio system must:
- keep the split between edit mode and public live mode
- preserve structured sections and dynamic navigation
- preserve the CMS separation of settings vs content collections
- provide starter templates and guided onboarding
- implement safe scoped delete behavior
- turn themes into a true Theme Studio
- turn Book Me into a premium native booking entry point
- support analytics and conversion-aware editing

---

# B. Finance — corrected as-is truth

## B.1 Page reality
The current Finance route is a **thin summary dashboard**, not a complete finance system.

It effectively has three widgets:
1. Earnings / invoice status
2. Forecast
3. Stripe dashboard access

There is no real ledger, payout reconciliation surface, transaction feed, or tax reporting workspace.

## B.2 Visual structure
The old Finance page visually fits the app:
- main app header with wallet icon and gradient title
- stacked single-column cards
- rounded corners and generous padding
- lots of whitespace

The problem is not visual coherence. The problem is functional thinness.

## B.3 Earnings widget truth
The earnings widget grouped values into:
- Paid
- Pending
- Overdue

It provided date ranges like:
- Last 30 Days
- Last 90 Days
- Last 6 Months
- Year to Date
- All Time

### Actual logic problem
It derived values from job status and job price helpers rather than a strong invoice/payment ledger.

Observed rules:
- `paid` jobs counted as paid
- `invoice-sent` jobs counted as pending or overdue
- overdue aging was approximated using **job date + payment terms** instead of authoritative invoice send timestamps

This must be replaced.

## B.4 Currency issue
At least one formatter used `en-US` and `USD`, which conflicts with Museio’s Australia-first direction.
All finance and tax flows must become regionally coherent and configurable.

## B.5 Forecast widget truth
The forecast widget had Weekly and Monthly modes, but the internal semantics were messy.
It mixed status handling inconsistently and had time-bucket/range mismatches.

Rebuild requirement:
Forecast logic must be rewritten with explicit period semantics and test coverage.

## B.6 Stripe widget truth
The old Stripe card depended on account-status checks and could disappear when setup was incomplete.
When visible, it mostly opened a generic Stripe dashboard URL.

Rebuild requirement:
Make Stripe setup and dashboard access product-native, account-aware, and integrated with deposits, balances, split payouts, and payout status.

## B.7 Rebuild requirements
The new Finance area must become a real business workspace with:
- earnings overview
- invoice aging
- forecast
- deposits and balances
- payouts and fees
- Stripe account state
- tax centre with GST and BAS reporting
- tax reserve tracker
- transaction classification and manual adjustments

## B.8 Minimum replacement rules
- invoice aging must come from authoritative invoice timestamps and payment terms
- payment states must come from payment records and webhooks, not loose job proxies
- currency and locale must be configurable and Australia-first by default
- forecast must use coherent period windows and documented inclusion rules
- Stripe surfaces must be product-native rather than generic external shortcuts

---

# C. Priority consequence for Antigravity

If the Figma code or any earlier prompt underspecifies Portfolio or Finance, this file wins.
