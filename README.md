# ASTROVERSE

ASTROVERSE is the local event website for the organizer-provided NASA International Space Apps Challenge 2026 programme at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, **14–16 November 2026**. The site includes the event landing pages, leader account verification, team registration, participant dashboard, QR verification, and protected organizer tools.

## Architecture

- React 19, Vite, TypeScript, React Router
- Supabase Auth for team-leader email/password accounts and email-confirmation links
- Supabase PostgreSQL for teams, participants, event settings, organizer access, audit records, and QR lookups
- Database row-level security (RLS) and transactional PostgreSQL functions protect all persistent records
- Netlify hosts the static SPA and handles client-side route rewrites; no Netlify Functions or Netlify Database are used

Only the team leader creates an account. The leader must confirm their email before signing in. A successful login opens `/register`; if that leader already submitted a team, the page directs them to their dashboard. Other participants do not need accounts. Their details are stored under the leader's registration.

## Configure Supabase

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/migrations/20261019140000_create_astroverse_portal.sql`](./supabase/migrations/20261019140000_create_astroverse_portal.sql) once. It creates the tables, RLS policies, atomic registration function, admin check, PII-limited public verification, audit triggers, and initial event settings. Registration is initially open in keeping with the prior organizer-approved project configuration; organizers can close it in `/admin/settings`.
3. Run [`supabase/migrations/20261019150000_restrict_admin_to_designated_email.sql`](./supabase/migrations/20261019150000_restrict_admin_to_designated_email.sql) in SQL Editor. This removes other admin allowlist entries and makes the database recognize only the designated, email-confirmed organizer account as an admin.
4. Run [`supabase/migrations/20261019170000_registration_problem_and_participant_ids.sql`](./supabase/migrations/20261019170000_registration_problem_and_participant_ids.sql) in SQL Editor. It adds the challenge choice, migrates existing IDs, and assigns one team ID plus a distinct ID to each participant. Back up production data before applying schema migrations.
   This migration updates the `register_team` RPC to accept `p_problem_statement` and refreshes PostgREST's schema cache. If team submission still reports that `public.register_team(...)` is missing, first check **SQL Editor → History** to confirm the migration completed successfully. If it already completed, run this separately in SQL Editor and retry:

   ```sql
   notify pgrst, 'reload schema';
   ```

   The function should be visible with this check:

   ```sql
   select pg_get_function_identity_arguments(p.oid)
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'register_team';
   ```

   It must include `p_problem_statement text`. If the function is absent or has a different signature, apply the migration once; do not repeatedly run a data migration on production.
   If the migration previously failed with `cannot ALTER TABLE ... because it has pending trigger events`, use the corrected migration file and run the complete script again. It temporarily removes and then recreates the deferred integrity triggers around the existing-record backfill.
5. Run [`supabase/migrations/20261019180000_fix_team_id_hyphen_format.sql`](./supabase/migrations/20261019180000_fix_team_id_hyphen_format.sql) in SQL Editor to use the `BIAS-NSAC26-T002` format for team IDs and normalize any IDs already generated with an underscore.
6. Run [`supabase/migrations/20261019190000_admin_console_and_team_queries.sql`](./supabase/migrations/20261019190000_admin_console_and_team_queries.sql) in SQL Editor before using the dashboard contact form or the redesigned admin features. It adds protected team queries, organizer-only team/member editing, soft deletion and restore, and hides archived registrations from team-owner access and public verification. Archived teams remain stored, are excluded from CSV exports, and can be restored from `/admin/bin`.
7. Run [`supabase/migrations/20261019200000_allow_admin_to_delete_team_queries.sql`](./supabase/migrations/20261019200000_allow_admin_to_delete_team_queries.sql) to allow authorized organizers to delete submitted queries. Query deletion is recorded in the audit table.
8. In **Authentication → URL Configuration**, set the production site URL and add local and deployed callback URLs to the redirect allow list, including the callback query string. For local Vite, allow `http://localhost:5173/**`; add the final HTTPS domain and any Netlify preview callback URL you will use.
9. Require email confirmation for signups. The app sends a confirmation link back to `/auth/callback`, confirms the account, then asks the leader to sign in. For production email delivery, configure a verified SMTP provider in Supabase Auth; Supabase's built-in mail service is rate-limited and intended for testing. To keep Supabase Auth and use Brevo only as its SMTP delivery provider:
   - In Brevo, activate transactional email and authenticate the sending domain. Add the DNS records Brevo supplies for domain authentication before sending to real users.
   - In **Brevo → Settings → SMTP & API → SMTP**, copy the SMTP login and create/copy an **SMTP key**. Do not use an API key.
   - In **Supabase → Authentication → SMTP Settings**, enable custom SMTP and enter host `smtp-relay.brevo.com`, port `587`, the Brevo SMTP login and SMTP key, and a sender email address verified in Brevo. Set a recognizable sender name such as `ASTROVERSE | BIAS-NSAC`.
   - Save and test signup confirmation and password-reset emails. Keep the existing Supabase Auth templates, callback URL and redirect allow list unchanged.
   - Check **Supabase → Authentication → Rate Limits** and the Brevo account's sending quota before raising limits. Custom SMTP changes the delivery provider; it does not change the app's auth flow or automatically raise Supabase or Brevo sending limits. Never put the SMTP key or a Brevo API key in `.env`, frontend code or the source archive.
   Keep the confirmation email template's verification URL intact (the default `{{ .ConfirmationURL }}` is supported). Do not replace it with a direct link to `/auth/callback` that carries no verification code or token.
10. Set Supabase Auth's minimum password length to 10 characters or more to match the signup form.
11. Copy `.env.example` to `.env` and fill in the public project URL and anon/publishable key from **Project Settings → API**:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
   ```

   The anon/publishable key is designed for browser use and is constrained by RLS. **Never** put the Supabase service-role key in a `VITE_` variable, frontend code, or a committed file.

## Run locally

Use Node.js 22 or newer:

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

Fill in `.env` before using authentication, registration, or database-backed pages. Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Unlike the previous Netlify-backed version, plain Vite can now call Supabase directly; it does not require a local Netlify API server. Restart Vite after installing the new dependency or changing `.env` so module resolution and Vite's environment values refresh. The production build command is `npm run build`.

## Organizer access

Only the verified Supabase account for `mohdanas@birlainstitute.co.in` can use organizer tools. Admin access is checked server-side by the `is_admin()` database function and the `admin_users` UUID allowlist; changing frontend code or another user's metadata cannot grant access.

For first-time setup:

1. Open `/signup` and create an account using `mohdanas@birlainstitute.co.in`. Confirm the email using the Supabase verification link. The organizer sign-in page also links to account creation.
2. After confirming the email, run [`supabase/migrations/20261019160000_provision_designated_admin.sql`](./supabase/migrations/20261019160000_provision_designated_admin.sql) in Supabase SQL Editor. This adds the user to `admin_users` only when that exact account exists and its email is confirmed. It is safe to run again.

3. Sign in at `/admin/login`. The designated email is routed to `/admin`; an unprovisioned or unconfirmed account is signed out and denied access. If the migration is run before the account is confirmed, verify the account and run the migration again.

The restriction migration removes any other accounts from `admin_users`; only this confirmed email passes the database admin check. The password is managed by Supabase Auth and must never be added to source code, `.env`, or SQL migrations. Since the password was shared in chat, change it in Supabase Auth before using the account.

## Deploy on Netlify

1. Connect this project as the Netlify site's base directory.
2. Set build command to `npm run build` and publish directory to `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Netlify build environment variables. These are public client settings, not service-role credentials.
4. Deploy the static app, then add its production URL and `/auth/callback` to the Supabase Auth redirect allow list and set the matching Site URL.
5. Configure production SMTP and test signup, email confirmation, login, password recovery, registration, dashboard, public QR verification, and organizer authorization on HTTPS before opening public registration.

Netlify's `netlify.toml` supplies the SPA rewrite so direct links such as `/register`, `/dashboard`, `/verify/...`, and `/admin/...` resolve to the app. Supabase provides the auth and database backend.

## Data protection

- RLS limits registration reads to the owning team leader and authorized admins.
- `register_team` validates the confirmed leader identity, event setting, consent, team size, roles, distinct participant emails and mobile numbers, then saves all related rows in one transaction.
- Admin status requires both the protected UUID mapping in `admin_users` and the designated, email-confirmed organizer account.
- Public QR verification reveals only the participant ID, team ID, team name, institution, category, and status; it never returns participant email or mobile details.
- Admin exports contain private contact data. Store and share them only with authorized organizers and follow the approved retention policy.
- Supabase Auth email confirmation must be enabled in the Supabase project; the frontend also checks that the current account is confirmed before login-protected actions.

## Content and assets

Event copy, schedule, FAQ, gallery captions, and quiz content are under `src/data`. Genuine organizer-supplied event photos are in `public/gallery`; do not replace them with stock images. Event policy details that have not been confirmed should remain marked as unconfirmed.

## Validation status

The production Vite build and TypeScript check pass locally. The build still reports the existing missing `/img/hero-planet.webp` asset and a large JavaScript chunk warning. The Supabase migration and live signup, email-confirmation, registration, and database-security flows have **not** been tested against a configured Supabase project. Complete the setup and acceptance steps above before using it for real registrations.

## Source archive

Regenerate `public/downloads/astroverse-source.zip` after source changes with:

```powershell
python scripts/package-project.py
```

The package script excludes `.env` files other than `.env.example`, dependencies, build output, and existing ZIP archives.
