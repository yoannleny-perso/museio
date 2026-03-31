# 18 Portfolio Demo Walkthrough

## Local Setup

Use the workspace env example as the baseline. For local web + API testing, set:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true`
- `API_PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

## Demo Flow

1. Open `/`
   - confirm the public Museio landing shell renders

2. Open `/app`
   - confirm the protected creator workspace shell renders

3. Open `/app/portfolio`
   - review seeded artist settings for `Nova Lune`
   - inspect visibility, handle, theme, section order, and collection readiness

4. In the editor:
   - change the theme
   - toggle public/private
   - edit handle, artist name, or bios
   - remove a section from layout
   - re-add a hidden section through the add-section sheet

5. Open `/:handle`
   - confirm the public page has no app chrome
   - confirm only enabled sections with content render
   - confirm empty sections are hidden automatically

6. Open `/:handle/book`
   - confirm the booking CTA lands on a placeholder entry page instead of a broken route

## What To Look For

- settings and structure changes are API-owned
- safe section removal does not delete collection content
- live mode is visually distinct from edit mode
- public/private enforcement is server-owned
- the mobile app mirrors the protected-shell boundary and portfolio entry under `/app`
