# 02 Design System Extraction Plan

## Goal

Extract a production-ready design system from `app_build/figma_seed/` while separating:

- operational creator-app UI
- portfolio/public marketing and booking UI

The seed is a style source, not a component architecture source.

## Extraction Strategy

We should extract in this order:

1. foundational tokens
2. semantic tokens
3. operational primitives
4. portfolio/public primitives
5. composite patterns
6. motion and state patterns

## Tokens To Keep

### Color direction

- soft neutral operational surfaces
- premium accent-led portfolio themes
- subtle gradient usage for hero cards and entry surfaces
- elevated/surface layering model already visible in Finance, Portfolio, and Tax Centre

### Spacing and shape

- rounded card system
- generous internal padding
- mobile-first vertical rhythm
- large touch targets

### Typography intent

- strong title/body contrast
- premium large-format headings for public portfolio
- clean compact operational labels and supporting text

### Motion cues

- reveal animations for portfolio/public surfaces
- lightweight progress/transition cues in flows
- active-state emphasis for builder and tab interfaces

## Tokens To Revise

### Brand color system

Current seed bias:

- strong purple-led system

Revision:

- keep purple as one supported accent family
- introduce semantic role tokens independent of brand accent
- allow theme-driven public accents without polluting operational semantics

### Semantic status colors

Current issue:

- status meaning is inconsistently derived from visual color alone

Revision:

- add semantic tokens for success, warning, error, info, sync, deposit, overdue, payout, tax, and disabled

### Typography system

Current issue:

- seed relies mostly on ad hoc utility sizing

Revision:

- formalize type ramps for:
  - operational app
  - editorial/public pages
  - dense data views

### Radius/elevation

Current issue:

- radius values are visually coherent but not systematized by component role

Revision:

- define tiers for chip, field, card, sheet, modal, hero media

### Motion

Current issue:

- motion is embedded directly in page code

Revision:

- define motion tokens for duration, easing, reveal distance, scroll thresholds, and reduced-motion fallbacks

## Tokens To Reject

- page-local hardcoded colors with no semantic meaning
- route-specific inline gradients
- one-off shadow recipes that do not map to a scale
- window-dependent layout values embedded in components

## Component Inventory To Keep Conceptually

### Operational primitives

- button
- input
- textarea
- select
- checkbox
- switch
- tabs
- dialog
- drawer/sheet
- card
- badge
- table/list row
- empty state
- status banner

### Portfolio/public primitives

- hero container
- media rail/gallery
- testimonial card/carousel
- brand-logo row
- package card
- FAQ accordion
- booking CTA section
- sticky mobile CTA
- section navigation rail

### Cross-cutting patterns

- app header blocks
- section wrappers
- KPI/metric cards
- finance summary cards
- progress bars
- setup reminders

## Components To Rewrite Instead Of Reuse

- `AppContext`-dependent feature components
- route pages that mix UI and domain logic
- HTML5 drag-and-drop portfolio builder interactions
- browser-only share/copy/publish helpers
- finance widgets with embedded calculations
- tax widgets with mock reporting logic
- booking forms with local-only step state and fake submit behavior

## Component API Strategy

### `packages/ui`

Should expose:

- token-backed primitives only
- surface variants for `operational` and `public`
- state-friendly props
- accessibility-first APIs

### `packages/domain`

Should own:

- status mappings
- state labels
- workflow badges and semantic meaning inputs

### `packages/validation`

Should own:

- form shape validation
- server payload validation
- public action token validation

## Public vs Operational Visual Language Strategy

## Operational App

Desired feel:

- reliable
- touch-first
- efficient
- financially trustworthy

Rules:

- restrained gradients
- high legibility
- dense-but-breathable cards
- semantic state colors
- consistent nav and form controls

## Portfolio/Public Web

Desired feel:

- premium
- cinematic
- editorial
- conversion-aware

Rules:

- stronger display typography
- richer theme presets
- media-forward composition
- immersive hero treatments
- booking CTA continuity without route-jump feeling

## Finance Visual Language Strategy

Keep:

- stacked card layout
- generous whitespace
- summary-to-detail flow

Revise:

- move from decorative dashboard cards to semantically structured financial surfaces
- introduce clearer data density tiers
- add durable visual patterns for:
  - overdue
  - deposit paid
  - balance due
  - payout pending
  - payout failed
  - reconciliation state
  - tax readiness

## Cross-Platform Extraction Notes

Because production mobile is Expo / React Native:

- tokens must be platform-agnostic
- component recipes must map to both web and native
- browser-only assumptions from the seed cannot be carried over
- drag/drop, clipboard, share, and modal patterns need platform-specific adapters

## Proposed Package Breakdown

### `packages/ui`

- token exports
- primitives
- state components
- chart shells
- portfolio/public composition blocks

### `packages/types`

- component-facing transport types
- analytics payload types

### `packages/validation`

- Zod schemas for forms and API payloads

### `packages/domain`

- enums
- state machines
- label mappers
- policy helpers

## Extraction Deliverables

1. Token map from current seed
2. Semantic token map for production
3. Component inventory with keep/rewrite decisions
4. Cross-platform implementation notes for web vs Expo
5. Motion/accessibility guidance

## Assumptions

- The best value in the seed is visual composition, not component internals.
- Portfolio/public and operational app surfaces should share foundations but not the same visual vocabulary everywhere.
- Expo Native support requires design tokens that are not Tailwind-only.

## Risks

- Over-reusing seed components will leak browser-only assumptions into mobile.
- Under-specifying semantic state tokens will hurt Finance, Tax, and Booking clarity.
- Keeping a single undifferentiated UI bucket will flatten Museio’s dual visual language.

## Approval Gates

- Gate 1: approve dual-language design-system strategy: operational vs portfolio/public.
- Gate 2: approve semantic status token expansion for finance/tax/payment/sync states.
- Gate 3: approve rewrite of builder, booking, finance, and tax feature components instead of direct reuse.
- Gate 4: approve cross-platform token strategy for Next.js and Expo.
