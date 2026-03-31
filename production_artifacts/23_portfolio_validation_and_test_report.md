# 23 Portfolio Validation And Test Report

## Workspace Verification

Executed successfully:

- `npm exec --yes pnpm@10.6.0 install`
- `npm exec --yes pnpm@10.6.0 -- lint`
- `npm exec --yes pnpm@10.6.0 -- typecheck`
- `npm exec --yes pnpm@10.6.0 -- test`
- `npm exec --yes pnpm@10.6.0 -- build`

## Local Supabase Verification

Succeeded:

- started local Supabase stack with the official CLI binary
- applied Portfolio migration successfully with `psql`
- verified Portfolio tables exist
- verified `portfolio-media` bucket exists
- verified RLS policies exist

## End-To-End Portfolio Verification

Verified locally through the API with a real Supabase session:

- protected editor bootstrap created a starter portfolio row
- settings update persisted handle, bios, social links, theme, and Book Me shell content
- portrait upload worked
- photo create, update, and delete worked
- video create worked
- music release create plus cover upload/delete worked
- event create plus image upload/delete worked
- featured card create plus image upload/delete worked
- private public-route request returned 403
- published public-route request returned 200
- handle uniqueness conflict returned 409 for a second user
- disabling the Photos section did not delete photo content
- deleting uploaded assets removed storage objects

## Storage Verification

Post-delete verification showed:

- `storage.objects` count for `portfolio-media` returned `0`

## Public Web Verification

Verified with the built Next.js app:

- live public route served successfully when the handle existed
- missing-handle route now returns HTTP 404
- canonical metadata is emitted for public routes

## Hosted Verification Limits

Could not complete on the hosted Supabase project:

- remote migration apply was blocked because `SUPABASE_DB_PASSWORD` is still unavailable
- hosted schema probe confirmed the tables are not present yet

Additional environment-specific note:

- one hosted schema probe in this shell required disabling TLS verification because the environment injects a self-signed certificate chain

That TLS bypass was used only for diagnostics and was not introduced into application code.
