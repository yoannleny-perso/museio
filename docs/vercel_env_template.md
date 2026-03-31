# Vercel Environment Template

Use these variable names in the Vercel project for the web app.

Do not commit secret values. Add real values only in the Vercel dashboard.

## Required

```text
NEXT_PUBLIC_APP_URL=<your-vercel-preview-url>
NEXT_PUBLIC_API_URL=<your-railway-api-url>/api
NEXT_PUBLIC_SUPABASE_URL=<your-hosted-supabase-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-hosted-publishable-key>
NEXT_PUBLIC_ENABLE_DEMO_AUTH=false
```

## Optional Compatibility Variables

If your team prefers keeping anon-key aliases populated too:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same-public-anon-or-publishable-key-if-used-by-your-project>
```

## Notes

- `NEXT_PUBLIC_APP_URL` should be the actual Vercel preview domain for the deployment being tested
- `NEXT_PUBLIC_API_URL` must include `/api`
- Vercel does not need the Supabase service role key
