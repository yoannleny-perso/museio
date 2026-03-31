# 21 Portfolio CRUD Build Log

## Backend

Replaced the Portfolio seed store with a Supabase-backed service in:

- `app_build/museio_app/apps/api/src/portfolio/portfolio.service.ts`

Added server-owned behavior for:

- authenticated editor bootstrap
- starter portfolio creation
- settings updates
- handle normalization and uniqueness checks
- section add / reorder / disable
- portrait upload and delete
- photo CRUD and image replacement
- video CRUD
- music release CRUD and cover upload/delete
- event CRUD and image upload/delete
- featured card CRUD and image upload/delete
- public portfolio fetch with visibility enforcement

## API Surface

Expanded `PortfolioController` with protected endpoints for:

- settings and layout
- media uploads
- item CRUD by collection

## Shared Contracts

Extended shared types and validation for:

- content item storage paths
- optional collection image fields
- sort order
- public canonical URL
- create/update contracts for every supported collection

## Web Editor

Updated the protected web editor to use:

- real Supabase sessions
- bearer-token API requests
- real CRUD forms
- private storage uploads
- safe section removal messaging
- stronger empty states

## Auth

Removed the implicit development demo-auth fallback from:

- web auth context
- mobile auth context
- API auth session contract

Added password sign-in / sign-up shells for web and mobile so the runtime can use real session flows during local verification.

## Decisions Preserved

- removing a section changes layout only
- content is only deleted when the user explicitly deletes an item
- public live mode never receives edit controls
- business logic remains in the API layer, not in the client
