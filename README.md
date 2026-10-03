# Developer Portfolio

A single-owner portfolio: a public home page driven entirely by data, and an authenticated dashboard to manage it.

**Stack:** React 18, TypeScript, Vite, React Router, Supabase (Postgres, Auth, Storage). Plain CSS with design tokens and a separate dark theme.

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor (one file, safe to re-run). It creates every table, trigger, RLS policy, the view counter and the `media` storage bucket (5 MB, JPG/PNG/WebP, access only inside `<user-id>/`).
3. Authentication → Users → create your account, then **disable public sign-ups** (Authentication → Providers → Email). The home page shows the earliest profile, so only you should have an account.
4. Authentication → URL configuration: add your site URL and `/login` as redirect URLs (needed for password reset).
5. `cp .env.example .env` and fill in the URL and **anon** key. Never put the service role key in the frontend.
6. `npm install && npm run dev`, sign in at `/login`, fill in your profile.

## Upgrading an existing database
After `schema.sql`, run `supabase/migrations/006_case_study.sql` (case-study fields, project slug and logo, resume link). It is additive and idempotent.

## Build and deploy
SPA fallback is preconfigured for Netlify (`public/_redirects`) and Vercel (`vercel.json`); on other hosts rewrite all paths to `index.html`.

`npm run build` outputs `dist/`. Host it as a static site with an SPA fallback to `index.html`.

## Security notes
All authorization is enforced by RLS. Visitors read only visible skills and published projects; writes require `owner_id = auth.uid()`; storage writes are restricted to the caller's folder. Client validation is a convenience: table checks and bucket limits are the enforcing layer.

## Not built yet
Profile live preview, technology icons, an engineering-principles block (it would need real, owner-written content), gallery upload progress bars, image resizing (needs Supabase image transformations or a CDN), sitemap, and pre-rendered Open Graph for social crawlers.

## Security review (summary)
- Every table has RLS. Writes need `owner_id = auth.uid()`; gallery inserts also verify the parent project belongs to the caller (no IDOR).
- Profiles: insert is limited to the first account at the database level, so leaving sign-ups open cannot create a second owner.
- Storage: writes only inside `<uid>/`, 5 MB, image MIME types enforced by the bucket.
- Views: written only through the `record_view` function; reading requires the owner. Counts can be inflated by scripted requests; they are indicative, not exact.
- Public by design: profile fields (including the public email), visible skills, published projects, social links.
- Deleting a project removes its gallery rows but not the files; remove those from the bucket manually if needed.

## Mobile
The dashboard menu is a slide-in drawer below 860px (closes on selection, backdrop tap or Esc). Controls grow to 44px on touch devices, safe-area insets are respected, and the layout was checked by build only, not on physical devices.
