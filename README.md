# BIAS-NSAC (NASA International Space Apps Challenge 2026)

**BIAS-NSAC** is the official web portal for the NASA International Space Apps Challenge 2026 hosted by **Birla Institute of Applied Sciences (BIAS)**, Bhimtal, Uttarakhand, scheduled for **14–16 November 2026**.

The portal powers event discovery, participant registration, team dashboard with digital ID card generation, public QR-based verification, and a comprehensive organizer administration console.

---

## Key Features

- **Public Event Portal:** Complete overview of challenge tracks (School & College categories), guidelines, speaker archives, FAQ, and interactive space quiz.
- **Event Schedule & Itinerary:** Day-by-day activity breakdown with one-click **PDF Itinerary Download** (`/venue-schedule`).
- **Team Leader Registration:** Secure email-verified account signup; team leaders register and manage 4–6 member squads with problem statement selection.
- **Participant Dashboard:** Manage squad details, contact organizers directly via team query support, and generate/print **QR-enabled digital ID cards**.
- **PII-Safe QR Verification:** Public scan-to-verify endpoint (`/verify/:registrationId`) that confirms genuine participation without exposing personal contact details.
- **Organizer Admin Console:** Protected dashboard for organizers to manage registrations, edit teams, respond to queries, soft-delete/restore records, toggle registration status, and export sanitized attendee CSVs.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Lucide Icons, Framer Motion
- **Styling:** Custom CSS with dark mode aesthetics, responsive flex/grid layouts, and print-ready ID card styling
- **Backend & Auth:** Supabase Auth (email/password with mandatory email confirmation)
- **Database:** Supabase PostgreSQL with strict Row Level Security (RLS), atomic transactional registration RPC, and audit logs
- **Hosting:** Netlify (Static SPA with client-side route rewrites via `netlify.toml`)

---

## Project Structure

```text
COLLEGE_PORTAL-main/
├── public/
│   ├── gallery/          # Genuine organizer-supplied event photographs
│   ├── img/              # Branding and hero background artwork
│   └── itineary/         # Event itinerary PDF document (Itinerary-PDF.pdf)
├── src/
│   ├── components/       # Shared UI components (Layout, UI, Countdown, FAQList, etc.)
│   ├── data/             # Event constants, FAQs, schedule details, and PDF links
│   ├── lib/              # Supabase client, AuthProvider, and typed API services
│   ├── pages/            # Public pages, Auth, Dashboard, ID card, Admin, Verify
│   ├── styles.css        # Core design system and print layouts
│   └── extra.css         # Page-specific styling, schedule overview, and animations
├── supabase/
│   └── migrations/       # PostgreSQL schema, RLS policies, functions, and audit triggers
├── package.json          # Project metadata and dependencies
└── vite.config.ts        # Vite build configuration
```

---

## Local Development Setup

### Prerequisites
- **Node.js:** v20.x or newer (Node.js 22 recommended)
- **npm:** v10.x or newer

### Installation

1. Open the repository root:
   ```bash
   cd COLLEGE_PORTAL-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your public Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
   ```
   *(Never add the Supabase service-role secret key to client-side code or `.env`).*

4. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

---

## Supabase Database Configuration

To set up the database and backend functions:

1. Create a project in [Supabase](https://supabase.com).
2. In the Supabase **SQL Editor**, run the migration scripts located in `supabase/migrations/` in chronological order:
   - `20261019140000_create_astroverse_portal.sql` — Sets up core schema, tables, RLS policies, atomic `register_team` function, and audit triggers.
   - `20261019150000_restrict_admin_to_designated_email.sql` — Secures admin role checks to confirmed organizer accounts.
   - `20261019170000_registration_problem_and_participant_ids.sql` — Adds problem statement selection and formatted team/participant IDs.
   - `20261019180000_fix_team_id_hyphen_format.sql` — Enforces standardized `BIAS-NSAC26-TXXX` ID formatting.
   - `20261019190000_admin_console_and_team_queries.sql` — Implements organizer query management, soft-delete, and team editing.
   - `20261019200000_allow_admin_to_delete_team_queries.sql` — Grants authorized admins permission to manage team queries.
3. In **Authentication → URL Configuration**, add `http://localhost:5173/**` and your production Netlify URL to the **Redirect URLs** allowlist.
4. Enable **Confirm email** under **Authentication → Email Auth**.

---

## Organizer Access Setup

Admin privileges are strictly verified at the database level via the `is_admin()` SQL function:

1. Sign up through the portal `/signup` with the designated organizer email: `mohdanas@birlainstitute.co.in`.
2. Confirm the account using the email verification link.
3. Run `supabase/migrations/20261019160000_provision_designated_admin.sql` in the Supabase SQL Editor to authorize the user in `public.admin_users`.
4. Sign in at `/admin/login` to access the organizer console.

---

## Netlify Deployment

1. Connect the GitHub / Git repository to **Netlify**.
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Add Environment Variables in Netlify site settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy the site. Netlify will use `netlify.toml` to handle SPA route redirection for subpaths (`/register`, `/dashboard`, `/verify/:id`, `/admin`, etc.).

---

## Security & Data Privacy

- **Row Level Security (RLS):** Team leaders can only read and modify their own registered teams. Unauthenticated users cannot query registrations.
- **Atomic Operations:** The transactional `register_team` function ensures all team members and details are validated and saved atomically.
- **Privacy-Preserving Public Verification:** The `/verify/:registrationId` route displays confirmation of registration, category, and institution while omitting private email addresses or phone numbers.
