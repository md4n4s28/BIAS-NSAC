-- Migration: Add participation_mode to registrations table and update stored procedures
-- -----------------------------------------------------------------------------

-- 1. Add participation_mode column to public.registrations
alter table public.registrations
  add column if not exists participation_mode text not null default 'offline'
  check (participation_mode in ('offline', 'online'));

-- 2. Update register_team function with p_participation_mode parameter
drop function if exists public.register_team(text, text, text, text, text, jsonb, boolean);
drop function if exists public.register_team(text, text, text, text, text, jsonb, boolean, text);

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

  if resolved_mode not in ('offline', 'online') then
    resolved_mode := 'offline';
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
  values (current_user_id, 'register-team', saved_registration.reference);

  return saved_registration;
end;
$$;

revoke all on function public.register_team(text, text, text, text, text, jsonb, boolean, text) from public, anon;
grant execute on function public.register_team(text, text, text, text, text, jsonb, boolean, text) to authenticated;

-- 3. Update admin_update_team to support participation_mode
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
  new_mode text := coalesce(lower(trim(p_team->>'participation_mode')), null);
begin
  if not public.is_admin() then
    raise exception 'Organizer authorization required.'
      using errcode = '42501';
  end if;

  if new_mode is not null and new_mode not in ('offline', 'online') then
    raise exception 'Participation mode must be offline or online.'
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
      participation_mode = coalesce(new_mode, saved_registration.participation_mode)
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

NOTIFY pgrst, 'reload schema';
