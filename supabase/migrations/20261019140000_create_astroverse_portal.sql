create sequence if not exists public.registration_reference_seq;

create table if not exists public.event_config (
  id integer primary key default 1 check (id = 1),
  min_members integer not null default 4 check (min_members between 1 and 20),
  max_members integer not null default 6 check (max_members between min_members and 20),
  registration_open boolean not null default false
);

insert into public.event_config (id, min_members, max_members, registration_open)
values (1, 4, 6, true)
on conflict (id) do nothing;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  reference text not null unique default (
    'NASA2026-BIAS-' || lpad(nextval('public.registration_reference_seq')::text, 6, '0')
  ),
  owner_id uuid not null unique references auth.users(id),
  team_name text not null check (length(trim(team_name)) between 2 and 100),
  institution text not null check (length(trim(institution)) between 2 and 200),
  category text not null check (category in ('school', 'college')),
  mentor text check (mentor is null or length(trim(mentor)) <= 120),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  member_count integer not null check (member_count between 1 and 20),
  consent_version text not null default '2026-01',
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_team_name_unique
  on public.registrations (lower(trim(team_name)));
create index if not exists registrations_status_idx
  on public.registrations (status);

create table if not exists public.participants (
  id bigint generated always as identity primary key,
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
create index if not exists participants_registration_idx
  on public.participants (registration_id);

create table if not exists public.audit (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  reference text not null,
  created_at timestamptz not null default now()
);

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
      and lower(users.email) = lower('mohdanas@birlainstitute.co.in')
      and users.email_confirmed_at is not null
  );
$$;

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

create or replace function public.register_team(
  p_team_name text,
  p_institution text,
  p_category text,
  p_mentor text,
  p_members jsonb,
  p_consent boolean
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

  insert into public.registrations (
    owner_id, team_name, institution, category, mentor, member_count
  ) values (
    current_user_id, trim(p_team_name), trim(p_institution), p_category,
    nullif(trim(coalesce(p_mentor, '')), ''), member_total
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

create or replace function public.public_verify_registration(p_reference text)
returns table (
  reference text,
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
  select r.reference, r.team_name, r.institution, r.category, r.status
  from public.registrations as r
  where r.reference = p_reference
    and p_reference ~ '^NASA2026-BIAS-[0-9]{6,}$'
  limit 1;
$$;

create or replace function public.audit_registration_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.audit (actor_id, action, reference)
  values (
    auth.uid(),
    case when tg_op = 'DELETE' then 'delete' else 'update:' || new.status end,
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

alter table public.event_config enable row level security;
alter table public.admin_users enable row level security;
alter table public.registrations enable row level security;
alter table public.participants enable row level security;
alter table public.audit enable row level security;

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

drop policy if exists registrations_owner_or_admin_read on public.registrations;
create policy registrations_owner_or_admin_read
on public.registrations for select
to authenticated
using (owner_id = auth.uid() or public.is_admin());

drop policy if exists registrations_admin_update on public.registrations;
create policy registrations_admin_update
on public.registrations for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists registrations_admin_delete_rejected on public.registrations;
create policy registrations_admin_delete_rejected
on public.registrations for delete
to authenticated
using (public.is_admin() and status = 'rejected');

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
  )
);

drop policy if exists audit_admin_read on public.audit;
create policy audit_admin_read
on public.audit for select
to authenticated
using (public.is_admin());

grant select on public.event_config to anon, authenticated;
grant update (min_members, max_members, registration_open) on public.event_config to authenticated;
grant select, update, delete on public.registrations to authenticated;
grant select on public.participants to authenticated;
grant select on public.audit to authenticated;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.register_team(text, text, text, text, jsonb, boolean) from public, anon;
grant execute on function public.register_team(text, text, text, text, jsonb, boolean) to authenticated;
revoke all on function public.public_verify_registration(text) from public;
grant execute on function public.public_verify_registration(text) to anon, authenticated;
revoke all on function public.check_registration_integrity() from public, anon, authenticated;
revoke all on function public.audit_registration_change() from public, anon, authenticated;
revoke all on function public.audit_config_change() from public, anon, authenticated;
