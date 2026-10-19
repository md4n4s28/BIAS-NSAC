alter table public.registrations
  add column if not exists deleted_at timestamptz;

create index if not exists registrations_deleted_at_idx
  on public.registrations (deleted_at)
  where deleted_at is not null;

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

alter table public.team_queries enable row level security;

drop policy if exists registrations_owner_or_admin_read on public.registrations;
create policy registrations_owner_or_admin_read
on public.registrations for select
to authenticated
using (
  public.is_admin()
  or (owner_id = auth.uid() and deleted_at is null)
);

revoke delete on public.registrations from authenticated;

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

grant select, insert on public.team_queries to authenticated;
grant update (status) on public.team_queries to authenticated;
grant usage, select on sequence public.team_queries_id_seq to authenticated;

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
      problem_statement = trim(p_team->>'problem_statement')
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

revoke all on function public.admin_update_team(text, jsonb, jsonb) from public, anon;
grant execute on function public.admin_update_team(text, jsonb, jsonb) to authenticated;

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

notify pgrst, 'reload schema';
