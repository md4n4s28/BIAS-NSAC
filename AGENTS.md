# ASTROVERSE architecture

This is the canonical React + Vite + TypeScript SPA, deployed as a static site on Netlify and backed by Supabase Auth and PostgreSQL.

- `src/main.tsx`: route composition, lazy pages, and the Supabase auth provider.
- `src/pages`: public pages, leader signup/login, team registration, dashboard, QR verification, and organizer tools.
- `src/lib/supabase.ts`: the sole browser Supabase client. Only the public anon/publishable key may be used here.
- `src/lib/auth.tsx`: verified-user session, admin role check, sign-out, and protected routes.
- `src/lib/api.ts`: typed Supabase operations used by registration, participant, admin, and public verification pages.
- `supabase/migrations`: PostgreSQL schema, transactional registration RPC, RLS policies, admin role check, public PII-safe verification, and audit triggers.
- `src/data`: editable editorial schedule/FAQ/gallery and quiz content; never store registrations here.
- `src/styles.css`: responsive design, reduced motion, and print ID layout.
- `public/gallery`: genuine supplied event photos; do not replace them with stock or AI imagery.
- `scripts`: authoring-only media tools and source ZIP packaging.

The team leader alone creates an account. Supabase email confirmation is required before login; successful login routes to `/register`, and an existing team leader is sent to their dashboard. Other participants are registration records, not required accounts. Admin access is granted only by a trusted operator inserting the verified Supabase Auth user UUID into `public.admin_users`. Never infer admin access from email, metadata, or client-side route checks.

RLS and database functions are the security boundary. Keep all registration writes atomic in `register_team`; validate the verified owner email and team membership in PostgreSQL. Public QR verification must return only the registration ID, team, institution, category, and status. Never add the Supabase service-role key to frontend code, Vite variables, `.env.example`, or a committed file. Do not create fake participant records.

Local build/dev/test commands are not permitted in this managed environment; report only static inspection and actual validations performed. Regenerate `public/downloads/astroverse-source.zip` after final source changes. Keep ASTROVERSE distinct from its host institute, preserve supplied event photos, and do not invent event policies or fee information.
