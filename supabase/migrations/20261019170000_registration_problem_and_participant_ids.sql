create sequence if not exists public.team_reference_seq;
create sequence if not exists public.participant_reference_seq;

drop trigger if exists registrations_integrity_check on public.registrations;
drop trigger if exists participants_integrity_check on public.participants;

create or replace function public.next_team_reference()
returns text
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  sequence_value bigint := nextval('public.team_reference_seq');
  sequence_text text;
begin
  sequence_text := sequence_value::text;
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
  sequence_text text;
begin
  sequence_text := sequence_value::text;
  return 'BIAS-NSAC26-P'
    || repeat('0', greatest(0, 3 - length(sequence_text)))
    || sequence_text;
end;
$$;

alter table public.registrations
  add column if not exists problem_statement text;

update public.registrations
set problem_statement = 'Not recorded (pre-update registration)'
where problem_statement is null;

with numbered as (
  select id, row_number() over (order by id)::text as sequence_text
  from public.registrations
)
update public.registrations as registrations
set reference = 'BIAS-NSAC26-T'
  || repeat('0', greatest(0, 3 - length(numbered.sequence_text)))
  || numbered.sequence_text
from numbered
where registrations.id = numbered.id;

alter table public.registrations
  alter column problem_statement set not null,
  alter column reference set default public.next_team_reference();

select setval(
  'public.team_reference_seq',
  greatest(count(*), 1),
  count(*) > 0
)
from public.registrations;

alter table public.participants
  add column if not exists reference text;

with numbered as (
  select id, row_number() over (order by id)::text as sequence_text
  from public.participants
)
update public.participants as participants
set reference = 'BIAS-NSAC26-P'
  || repeat('0', greatest(0, 3 - length(numbered.sequence_text)))
  || numbered.sequence_text
from numbered
where participants.id = numbered.id
  and participants.reference is null;

alter table public.participants
  alter column reference set default public.next_participant_reference(),
  alter column reference set not null;

create unique index if not exists participants_reference_unique
  on public.participants (reference);

select setval(
  'public.participant_reference_seq',
  greatest(count(*), 1),
  count(*) > 0
)
from public.participants;

create constraint trigger registrations_integrity_check
after insert or update on public.registrations
deferrable initially deferred
for each row execute function public.check_registration_integrity();

create constraint trigger participants_integrity_check
after insert or update or delete on public.participants
deferrable initially deferred
for each row execute function public.check_registration_integrity();

drop function if exists public.register_team(text, text, text, text, jsonb, boolean);
drop function if exists public.register_team(text, text, text, text, text, jsonb, boolean);

create function public.register_team(
  p_team_name text,
  p_institution text,
  p_category text,
  p_mentor text,
  p_problem_statement text,
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
    owner_id, team_name, institution, category, mentor, problem_statement, member_count
  ) values (
    current_user_id, trim(p_team_name), trim(p_institution), p_category,
    nullif(trim(coalesce(p_mentor, '')), ''), p_problem_statement, member_total
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

revoke all on function public.register_team(text, text, text, text, text, jsonb, boolean) from public, anon;
grant execute on function public.register_team(text, text, text, text, text, jsonb, boolean) to authenticated;

drop function if exists public.public_verify_registration(text);

create function public.public_verify_registration(p_reference text)
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
    and p_reference ~ '^BIAS-NSAC26-P[0-9]{3,}$'
  limit 1;
$$;

revoke all on function public.public_verify_registration(text) from public;
grant execute on function public.public_verify_registration(text) to anon, authenticated;

notify pgrst, 'reload schema';
