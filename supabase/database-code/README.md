# Supabase Database Setup Guide (BIAS-NSAC 2026)

This folder contains the complete, standalone database setup script for running the **BIAS-NSAC 2026** portal with a fresh [Supabase](https://supabase.com) project.

Instead of running multiple incremental migration files one by one, you only need to run **[`complete_schema.sql`](./complete_schema.sql)** once in your Supabase SQL Editor.

---

## What `complete_schema.sql` Sets Up

1. **Auto-incrementing ID Formats:**
   - Team IDs formatted as `BIAS-NSAC26-T001`, `BIAS-NSAC26-T002`, etc.
   - Participant IDs formatted as `BIAS-NSAC26-P001`, `BIAS-NSAC26-P002`, etc.
2. **Core Database Tables:**
   - `event_config`: Registration open/closed status and team size boundaries (default 4–6).
   - `admin_users`: Allowlist table for authorized organizers.
   - `registrations`: Squad records, category (`school`/`college`), problem statement, status (`pending`/`approved`/`rejected`), and soft-deletion (`deleted_at`).
   - `participants`: Individual members, roles (`leader`/`member`), and contact info.
   - `team_queries`: Team support ticket messages and status.
   - `audit`: Immutable change log for administrative tracking.
3. **Database Security & Validation:**
   - Row Level Security (RLS) policies on all tables so participants cannot see other teams' private data.
   - Deferred integrity triggers guaranteeing valid squad sizes and that the account owner is the team leader.
   - Atomic stored procedures: `register_team`, `admin_update_team`, and privacy-preserving `public_verify_registration`.

---

## Step-by-Step Setup Instructions

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New project**.
2. Select an organization, choose a project name (e.g. `bias-nsac-2026`), set a secure database password, and pick a region near your users.

---

### Step 2: Run the Database Script
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New query**.
3. Copy the entire contents of **[`complete_schema.sql`](./complete_schema.sql)** and paste it into the editor.
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
5. You should see `Success. No rows returned`. All tables, policies, functions, and triggers are now active.

---

### Step 3: Configure Supabase Authentication
1. Go to **Authentication → URL Configuration** in the Supabase dashboard:
   - Set **Site URL** to your local dev URL or your production domain:
     - Local: `http://localhost:5173`
     - Production: `https://your-domain.netlify.app`
   - Under **Redirect URLs**, add:
     - `http://localhost:5173/**`
     - `https://your-domain.netlify.app/**`
2. Go to **Authentication → Email Auth**:
   - Ensure **Enable email signup** is ON.
   - Ensure **Confirm email** is ON (the application requires confirmed accounts for team leaders and admins).

---

### Step 4: Provision Your First Admin / Organizer Account

To access the Organizer Admin Console at `/admin`:

1. Sign up on your website at `/signup` using your designated organizer email (e.g., `mohdanas@birlainstitute.co.in` or your own email).
2. Check your inbox and click the email confirmation link.
3. Go back to Supabase **SQL Editor** and run the following SQL command (replacing with your email):

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('YOUR_ORGANIZER_EMAIL@domain.com')
  and email_confirmed_at is not null
on conflict (user_id) do nothing;
```

4. You can now sign in at `/admin/login` to access the full organizer console.

---

### Step 5: Connect Your Frontend App

In the project root, create or update `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find both values in your Supabase dashboard under **Project Settings → API**.
