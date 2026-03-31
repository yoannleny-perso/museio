# Railway Environment Template

Use these variable names in the Railway service for the API.

Do not commit secret values. Add real values only in the Railway dashboard.

## Required

```text
NODE_ENV=production
SUPABASE_URL=<your-hosted-supabase-url>
SUPABASE_PUBLISHABLE_DEFAULT_KEY=<your-hosted-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-hosted-service-role-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key-or-approved-preview-placeholder>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret-if-webhooks-are-used-in-preview>
NEXT_PUBLIC_APP_URL=<your-vercel-preview-url>
CORS_ALLOWED_ORIGINS=<your-vercel-preview-url>
```

## Optional

```text
API_PORT=4000
```

Railway usually provides `PORT` automatically, so `API_PORT` is optional unless you need a local-style override.

## Future Production Note

When production web exists, expand:

```text
CORS_ALLOWED_ORIGINS=<your-vercel-preview-url>,<your-production-web-url>
```

## Do Not Add To Railway

- browser-only `NEXT_PUBLIC_SUPABASE_*` aliases that the API does not use
- TLS bypass variables
