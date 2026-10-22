-- ==============================================================================
-- BIAS-NSAC 2026: Complete Database Schema for Supabase
-- ==============================================================================
-- This script sets up the entire Supabase PostgreSQL backend from scratch:
-- 1. Sequences & ID generators for teams (BIAS-NSAC26-T001) & participants (BIAS-NSAC26-P001)
-- 2. Core tables: event_config, admin_users, registrations, participants, team_queries, audit
-- 3. Integrity triggers & validation logic
-- 4. RPC functions for atomic registration, admin team updates, and QR verification
-- 5. Row Level Security (RLS) policies & access grants
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Sequences & ID Generator Functions
-- ------------------------------------------------------------------------------

create sequence if not exists public.team_reference_seq;
create sequence if not exists public.participant_reference_seq;

create or replace function public.next_team_reference()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  sequence_value bigint := nextval('public.team_reference_seq');
  sequence_text text := sequence_value::text;
begin
  return 'BIAS-NSAC26-T'
    || repeat('0', greatest(0, 3 - length(sequence_text)))
    || sequence_text;
end;
$$;

create or replace function public.next_participant_reference()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  sequence_value bigint := nextval('public.participant_reference_seq');
  sequence_text text := sequence_value::text;
begin
  return 'BIAS-NSAC26-P'
    || repeat('0', greatest(0, 3 - length(sequence_text)))
    || sequence_text;
end;
$$;

-- ------------------------------------------------------------------------------
-- 2. Core Tables
-- ------------------------------------------------------------------------------

-- Event Configuration (Settings controlled by organizers)
create table if not exists public.event_config (
  id integer primary key default 1 check (id = 1),
  min_members integer not null default 4 check (min_members between 1 and 20),
  max_members integer not null default 6 check (max_members between min_members and 20),
  registration_open boolean not null default false
);

insert into public.event_config (id, min_members, max_members, registration_open)
values (1, 4, 6, true)
on conflict (id) do nothing;

-- Admin Users (UUIDs of authorized organizers)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Team Registrations
create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  reference text not null unique default public.next_team_reference(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  team_name text not null check (length(trim(team_name)) between 2 and 100),
  institution text not null check (length(trim(institution)) between 2 and 200),
  category text not null check (category in ('school', 'college')),
  mentor text check (mentor is null or length(trim(mentor)) <= 120),
  problem_statement text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  member_count integer not null check (member_count between 1 and 20),
  participation_mode text not null default 'offline' check (participation_mode in ('offline', 'online')),
  consent_version text not null default '2026-01',
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_team_name_unique
  on public.registrations (lower(trim(team_name)));
create index if not exists registrations_status_idx
  on public.registrations (status);
create index if not exists registrations_deleted_at_idx
  on public.registrations (deleted_at)
  where deleted_at is not null;

-- Team Participants / Members
create table if not exists public.participants (
  id bigint generated always as identity primary key,
  reference text not null unique default public.next_participant_reference(),
  registration_id bigint not null references public.registrations(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 120),
  email text not null,
  mobile text not null,
  institution text not null check (length(trim(institution)) between 2 and 200),
  role text not null check (role in ('leader', 'member'))
);

create unique index if not exists participants_email_unique
  on public.participants (lower(trim(email)));
create unique index if not exists participants_mobile_unique
  on public.participants (mobile);
create unique index if not exists participants_reference_unique
  on public.participants (reference);
create index if not exists participants_registration_idx
  on public.participants (registration_id);

-- Team Support Queries
create table if not exists public.team_queries (
  id bigint generated always as identity primary key,
  registration_id bigint not null references public.registrations(id) on delete cascade,
  title text not null check (length(trim(title)) between 3 and 120),
  message text not null check (length(trim(message)) between 10 and 2000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists team_queries_registration_created_idx
  on public.team_queries (registration_id, created_at desc);

-- Audit Log (Immutable record of administrative actions and registration changes)
create table if not exists public.audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  reference text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 3. Helper & Integrity Functions
-- ------------------------------------------------------------------------------

-- Organizer Role Verification
-- Checks whether the current user is recorded in admin_users and has confirmed email
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users as admins
    join auth.users as users on users.id = admins.user_id
    where admins.user_id = auth.uid()
      and users.email_confirmed_at is not null
  );
$$;

-- Integrity check to guarantee team sizes and leader identity
create or replace function public.check_registration_integrity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_registration_id bigint;
  registration_row public.registrations%rowtype;
  actual_count integer;
  leader_count integer;
  leader_email text;
  minimum_members integer;
  maximum_members integer;
begin
  if tg_table_name = 'participants' then
    target_registration_id := case when tg_op = 'DELETE' then old.registration_id else new.registration_id end;
  else
    target_registration_id := case when tg_op = 'DELETE' then old.id else new.id end;
  end if;

  select * into registration_row
  from public.registrations
  where id = target_registration_id;

  if not found then
    return null;
  end if;

  select min_members, max_members
  into minimum_members, maximum_members
  from public.event_config
  where id = 1;

  minimum_members := coalesce(minimum_members, 4);
  maximum_members := coalesce(maximum_members, 6);

  select count(*)::integer,
         count(*) filter (where role = 'leader')::integer,
         max(lower(trim(email))) filter (where role = 'leader')
  into actual_count, leader_count, leader_email
  from public.participants
  where registration_id = target_registration_id;

  if actual_count <> registration_row.member_count
     or actual_count < minimum_members
     or actual_count > maximum_members
     or leader_count <> 1 then
    raise exception 'The registration must contain the configured team size and exactly one leader.'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from auth.users
    where id = registration_row.owner_id
      and email_confirmed_at is not null
      and lower(email) = leader_email
  ) then
    raise exception 'The verified account email must belong to the team leader.'
      using errcode = '23514';
  end if;

  return null;
end;
$$;

-- Attach deferred constraint triggers
drop trigger if exists registrations_integrity_check on public.registrations;
create constraint trigger registrations_integrity_check
after insert or update on public.registrations
deferrable initially deferred
for each row execute function public.check_registration_integrity();

drop trigger if exists participants_integrity_check on public.participants;
create constraint trigger participants_integrity_check
after insert or update or delete on public.participants
deferrable initially deferred
for each row execute function public.check_registration_integrity();

-- ------------------------------------------------------------------------------
-- 4. RPC Functions (Registration, Admin Updates, Verification)
-- ------------------------------------------------------------------------------

-- Atomic Team Registration Function
create or replace function public.register_team(
  p_team_name text,
  p_institution text,
  p_category text,
  p_mentor text,
  p_problem_statement text,
  p_members jsonb,
  p_consent boolean,
  p_participation_mode text default 'offline'
)
returns public.registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  current_config public.event_config%rowtype;
  member_total integer;
  leader_total integer;
  leader_email text;
  saved_registration public.registrations%rowtype;
  resolved_mode text := coalesce(lower(trim(p_participation_mode)), 'offline');
begin
  if current_user_id is null then
    raise exception 'Sign in with a confirmed team leader account to continue.'
      using errcode = '42501';
  end if;

  select lower(email) into current_email
  from auth.users
  where id = current_user_id
    and email_confirmed_at is not null;

  if current_email is null then
    raise exception 'Confirm your email before registering a team.'
      using errcode = '42501';
  end if;

  select * into current_config
  from public.event_config
  where id = 1
  for share;

  if not found or not current_config.registration_open then
    raise exception 'Registration is currently closed.'
      using errcode = 'P0001';
  end if;

  if p_consent is distinct from true then
    raise exception 'Consent is required.'
      using errcode = '23514';
  end if;

  if length(trim(coalesce(p_team_name, ''))) not between 2 and 100
     or length(trim(coalesce(p_institution, ''))) not between 2 and 200
     or p_category not in ('school', 'college')
     or jsonb_typeof(p_members) <> 'array' then
    raise exception 'Check the team name, institution, category and member details.'
      using errcode = '23514';
  end if;

  if p_problem_statement is null or p_problem_statement not in (
    'Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars',
    'Be An Earth System Trend Detective!',
    'Build a Junior Astronaut Mission Trainer',
    'CLPS Lunar Mission Browser',
    'Create Health Monitoring Software for Astronauts on Space Missions',
    'Dancing with the SARs',
    'Field Shift: Adapting Farms with NASA Data',
    'Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data',
    'Harmonization of MODIS and VIIRS Hot Spots',
    'Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars',
    'Interplanetary Survival Guide: Martian Map',
    'Planet X and SPHEREx',
    'Space Mission Design Game',
    'The Earth Information Jukebox'
  ) then
    raise exception 'Choose a valid problem statement.'
      using errcode = '23514';
  end if;

  select count(*)::integer,
         count(*) filter (where member->>'role' = 'leader')::integer,
         max(lower(trim(member->>'email'))) filter (where member->>'role' = 'leader')
  into member_total, leader_total, leader_email
  from jsonb_array_elements(p_members) as item(member);

  if member_total < current_config.min_members
     or member_total > current_config.max_members
     or leader_total <> 1
     or lower(trim(p_members->0->>'role')) <> 'leader'
     or leader_email <> current_email then
    raise exception 'The team size or team leader does not match the registration rules.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_members) as item(member)
    where length(trim(coalesce(member->>'name', ''))) not between 2 and 120
       or length(trim(coalesce(member->>'institution', ''))) not between 2 and 200
       or coalesce(member->>'email', '') !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
       or coalesce(member->>'mobile', '') !~ '^[1-9][0-9]{7,14}$'
       or member->>'role' not in ('leader', 'member')
  ) then
    raise exception 'Check each member name, email, mobile, institution and role.'
      using errcode = '23514';
  end if;

  if exists (
    select lower(trim(member->>'email'))
    from jsonb_array_elements(p_members) as item(member)
    group by lower(trim(member->>'email'))
    having count(*) > 1
  ) or exists (
    select member->>'mobile'
    from jsonb_array_elements(p_members) as item(member)
    group by member->>'mobile'
    having count(*) > 1
  ) then
    raise exception 'Every participant must use a unique email and mobile number.'
      using errcode = '23514';
  end if;

  if resolved_mode not in ('offline', 'online') then
    resolved_mode := 'offline';
  end if;

  insert into public.registrations (
    owner_id, team_name, institution, category, mentor, problem_statement, member_count, participation_mode
  ) values (
    current_user_id, trim(p_team_name), trim(p_institution), p_category,
    nullif(trim(coalesce(p_mentor, '')), ''), p_problem_statement, member_total, resolved_mode
  )
  returning * into saved_registration;

  insert into public.participants (
    registration_id, name, email, mobile, institution, role
  )
  select
    saved_registration.id,
    trim(member->>'name'),
    lower(trim(member->>'email')),
    trim(member->>'mobile'),
    trim(member->>'institution'),
    member->>'role'
  from jsonb_array_elements(p_members) as item(member);

  insert into public.audit (actor_id, action, reference)
  values (current_user_id, 'register', saved_registration.reference);

  return saved_registration;
end;
$$;

-- Organizer Edit Team Function
create or replace function public.admin_update_team(
  p_team_reference text,
  p_team jsonb,
  p_members jsonb
)
returns public.registrations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  saved_registration public.registrations%rowtype;
  submitted_members integer;
  submitted_distinct_members integer;
  leader_email text;
  owner_email text;
begin
  if not public.is_admin() then
    raise exception 'Only an authorized organizer can edit team details.'
      using errcode = '42501';
  end if;

  if jsonb_typeof(p_team) <> 'object' or jsonb_typeof(p_members) <> 'array' then
    raise exception 'Provide valid team and participant details.'
      using errcode = '23514';
  end if;

  select * into saved_registration
  from public.registrations
  where reference = p_team_reference
    and deleted_at is null
  for update;

  if not found then
    raise exception 'The active team registration could not be found.'
      using errcode = 'P0002';
  end if;

  if length(trim(coalesce(p_team->>'team_name', ''))) not between 2 and 100
     or length(trim(coalesce(p_team->>'institution', ''))) not between 2 and 200
     or coalesce(p_team->>'category', '') not in ('school', 'college')
     or length(trim(coalesce(p_team->>'problem_statement', ''))) not between 1 and 300 then
    raise exception 'Check the team name, institution, category, and problem statement.'
      using errcode = '23514';
  end if;

  if length(trim(coalesce(p_team->>'mentor', ''))) > 120 then
    raise exception 'Mentor name must be 120 characters or fewer.'
      using errcode = '23514';
  end if;

  select count(*)::integer, count(distinct member->>'id')::integer
  into submitted_members, submitted_distinct_members
  from jsonb_array_elements(p_members) as item(member);

  if submitted_members <> saved_registration.member_count
     or submitted_distinct_members <> saved_registration.member_count then
    raise exception 'Every current team member must be included exactly once.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_members) as item(member)
    where coalesce(member->>'id', '') !~ '^[1-9][0-9]*$'
       or length(trim(coalesce(member->>'name', ''))) not between 2 and 120
       or trim(coalesce(member->>'email', '')) !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
       or coalesce(member->>'mobile', '') !~ '^[1-9][0-9]{7,14}$'
       or length(trim(coalesce(member->>'institution', ''))) not between 2 and 200
  ) then
    raise exception 'Check each participant name, email, mobile number, and institution.'
      using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_members) as item(member)
    left join public.participants as participant
      on participant.id = (member->>'id')::bigint
     and participant.registration_id = saved_registration.id
    where participant.id is null
  ) then
    raise exception 'A participant does not belong to this team.'
      using errcode = '23514';
  end if;

  select lower(trim(item.member->>'email'))
  into leader_email
  from jsonb_array_elements(p_members) as item(member)
  join public.participants as participant
    on participant.id = (item.member->>'id')::bigint
   and participant.registration_id = saved_registration.id
  where participant.role = 'leader';

  select lower(email) into owner_email
  from auth.users
  where id = saved_registration.owner_id
    and email_confirmed_at is not null;

  if leader_email is null or owner_email is null or leader_email <> owner_email then
    raise exception 'The team leader email must match the confirmed account that owns this team.'
      using errcode = '23514';
  end if;

  update public.registrations
  set team_name = trim(p_team->>'team_name'),
      institution = trim(p_team->>'institution'),
      category = p_team->>'category',
      mentor = nullif(trim(coalesce(p_team->>'mentor', '')), ''),
      problem_statement = trim(p_team->>'problem_statement'),
      participation_mode = coalesce(nullif(lower(trim(p_team->>'participation_mode')), ''), saved_registration.participation_mode)
  where id = saved_registration.id
  returning * into saved_registration;

  update public.participants as participant
  set name = trim(item.member->>'name'),
      email = lower(trim(item.member->>'email')),
      mobile = trim(item.member->>'mobile'),
      institution = trim(item.member->>'institution')
  from jsonb_array_elements(p_members) as item(member)
  where participant.id = (item.member->>'id')::bigint
    and participant.registration_id = saved_registration.id;

  insert into public.audit (actor_id, action, reference)
  values (auth.uid(), 'admin-update-team', saved_registration.reference);

  return saved_registration;
end;
$$;

-- PII-Safe Public QR Verification Function
-- Used by /verify/:id to verify badge validity without exposing emails or mobile numbers
create or replace function public.public_verify_registration(p_reference text)
returns table (
  reference text,
  team_reference text,
  team_name text,
  institution text,
  category text,
  status text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select participants.reference, registrations.reference, registrations.team_name,
         registrations.institution, registrations.category, registrations.status
  from public.participants as participants
  join public.registrations as registrations on registrations.id = participants.registration_id
  where participants.reference = p_reference
    and registrations.deleted_at is null
    and p_reference ~ '^BIAS-NSAC26-P[0-9]{3,}$'
  limit 1;
$$;

-- ------------------------------------------------------------------------------
-- 5. Audit Logging Triggers
-- ------------------------------------------------------------------------------

create or replace function public.audit_registration_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  audit_action text;
begin
  if tg_op = 'DELETE' then
    audit_action := 'delete';
  elsif old.deleted_at is null and new.deleted_at is not null then
    audit_action := 'archive';
  elsif old.deleted_at is not null and new.deleted_at is null then
    audit_action := 'restore';
  else
    audit_action := 'update:' || new.status;
  end if;

  insert into public.audit (actor_id, action, reference)
  values (
    auth.uid(),
    audit_action,
    case when tg_op = 'DELETE' then old.reference else new.reference end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists registrations_audit on public.registrations;
create trigger registrations_audit
after update or delete on public.registrations
for each row execute function public.audit_registration_change();

create or replace function public.audit_config_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.audit (actor_id, action, reference)
  values (auth.uid(), 'update-config', 'event-2026');
  return new;
end;
$$;

drop trigger if exists event_config_audit on public.event_config;
create trigger event_config_audit
after update on public.event_config
for each row execute function public.audit_config_change();

create or replace function public.audit_team_query_delete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  team_reference text;
begin
  select reference into team_reference
  from public.registrations
  where id = old.registration_id;

  insert into public.audit (actor_id, action, reference)
  values (auth.uid(), 'delete-team-query', coalesce(team_reference, 'unknown-team'));

  return old;
end;
$$;

drop trigger if exists team_queries_audit_delete on public.team_queries;
create trigger team_queries_audit_delete
after delete on public.team_queries
for each row execute function public.audit_team_query_delete();

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

alter table public.event_config enable row level security;
alter table public.admin_users enable row level security;
alter table public.registrations enable row level security;
alter table public.participants enable row level security;
alter table public.team_queries enable row level security;
alter table public.audit enable row level security;

-- Event Config Policies
drop policy if exists event_config_public_read on public.event_config;
create policy event_config_public_read
on public.event_config for select
to anon, authenticated
using (true);

drop policy if exists event_config_admin_update on public.event_config;
create policy event_config_admin_update
on public.event_config for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admin Users Policies
drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read
on public.admin_users for select
to authenticated
using (public.is_admin());

-- Registrations Policies
drop policy if exists registrations_owner_or_admin_read on public.registrations;
create policy registrations_owner_or_admin_read
on public.registrations for select
to authenticated
using (
  public.is_admin()
  or (owner_id = auth.uid() and deleted_at is null)
);

drop policy if exists registrations_admin_update on public.registrations;
create policy registrations_admin_update
on public.registrations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Participants Policies
drop policy if exists participants_owner_or_admin_read on public.participants;
create policy participants_owner_or_admin_read
on public.participants for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.registrations as r
    where r.id = participants.registration_id
      and r.owner_id = auth.uid()
      and r.deleted_at is null
  )
);

-- Team Queries Policies
drop policy if exists team_queries_owner_or_admin_read on public.team_queries;
create policy team_queries_owner_or_admin_read
on public.team_queries for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.registrations as registration
    where registration.id = team_queries.registration_id
      and registration.owner_id = auth.uid()
      and registration.deleted_at is null
  )
);

drop policy if exists team_queries_owner_insert on public.team_queries;
create policy team_queries_owner_insert
on public.team_queries for insert
to authenticated
with check (
  exists (
    select 1
    from public.registrations as registration
    where registration.id = team_queries.registration_id
      and registration.owner_id = auth.uid()
      and registration.deleted_at is null
  )
);

drop policy if exists team_queries_admin_update on public.team_queries;
create policy team_queries_admin_update
on public.team_queries for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists team_queries_admin_delete on public.team_queries;
create policy team_queries_admin_delete
on public.team_queries for delete
to authenticated
using (public.is_admin());

-- Audit Policies
drop policy if exists audit_admin_read on public.audit;
create policy audit_admin_read
on public.audit for select
to authenticated
using (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. Permissions & Grants
-- ------------------------------------------------------------------------------

grant select on public.event_config to anon, authenticated;
grant update (min_members, max_members, registration_open) on public.event_config to authenticated;
grant select, update on public.registrations to authenticated;
grant select on public.participants to authenticated;
grant select, insert on public.team_queries to authenticated;
grant update (status) on public.team_queries to authenticated;
grant delete on public.team_queries to authenticated;
grant usage, select on sequence public.team_queries_id_seq to authenticated;
grant select on public.audit to authenticated;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.register_team(text, text, text, text, text, jsonb, boolean, text) from public, anon;
grant execute on function public.register_team(text, text, text, text, text, jsonb, boolean, text) to authenticated;

revoke all on function public.admin_update_team(text, jsonb, jsonb) from public, anon;
grant execute on function public.admin_update_team(text, jsonb, jsonb) to authenticated;

revoke all on function public.public_verify_registration(text) from public;
grant execute on function public.public_verify_registration(text) to anon, authenticated;

revoke all on function public.check_registration_integrity() from public, anon, authenticated;
revoke all on function public.audit_registration_change() from public, anon, authenticated;
revoke all on function public.audit_config_change() from public, anon, authenticated;
revoke all on function public.audit_team_query_delete() from public, anon, authenticated;

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
