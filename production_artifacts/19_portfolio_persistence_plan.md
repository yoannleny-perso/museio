# 19 Portfolio Persistence Plan

## Scope

This phase replaces the Portfolio in-memory store with real Supabase persistence, private storage, authenticated CRUD, and hardened public read behavior.

## Implemented Architecture

- `apps/api` owns Portfolio persistence and public/private enforcement.
- `apps/web` consumes the Portfolio API with Supabase bearer sessions.
- `apps/mobile` keeps the protected session spine and authenticated Portfolio fetch path, but does not add full mobile CRUD UI in this phase.
- Supabase owns:
  - auth
  - Postgres tables
  - RLS
  - storage bucket for Portfolio media

## Data Model Decisions

- Canonical tables:
  - `portfolio_settings`
  - `portfolio_photos`
  - `portfolio_videos`
  - `portfolio_music_releases`
  - `portfolio_events`
  - `portfolio_featured_cards`
- Ownership is explicit with `owner_user_id uuid references auth.users(id)`.
- `portfolio_settings` stores:
  - public handle
  - visibility
  - theme
  - bios
  - social links
  - section enablement
  - section ordering
  - Book Me shell content
- Collection items live in dedicated tables.
- Built-in sections remain single-instance in this phase, but contracts include `instanceKey` to support future multi-instance expansion safely.

## Storage Decisions

- Bucket: `portfolio-media`
- Bucket is private.
- API generates signed URLs for editor and public live mode.
- Storage paths are owner-safe:
  - `{owner_user_id}/{portfolio_id}/{collection}/{item_id}/{timestamp}-{filename}`

## Public Route Decisions

- Edit mode stays protected at `/app/portfolio`.
- Live mode remains `/:handle`.
- Public rendering only shows:
  - public portfolios
  - enabled sections
  - sections with content
- Missing handles use a true web 404 path.
- Private handles return an intentional unavailable state from the app layer and 403 from the API layer.

## Assumptions

- `owner_user_id` is the canonical portfolio owner for this phase.
- `accountId` in shared contracts remains a shell identity and currently falls back to the auth user id when richer tenant metadata is absent.
- Portrait, gallery, release, event, and featured-card imagery are storage-backed rather than public URL fields.

## Approval Gates

- Hosted Supabase migration still needs a real remote apply step.
- The current hosted project cannot be considered production-ready until the schema is applied there.
- Booking and Finance remain out of scope and unimplemented.
