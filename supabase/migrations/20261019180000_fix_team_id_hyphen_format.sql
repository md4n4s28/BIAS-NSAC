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

alter table public.registrations
  alter column reference set default public.next_team_reference();

update public.registrations
set reference = regexp_replace(reference, '^BIAS_NSAC26-T', 'BIAS-NSAC26-T')
where reference ~ '^BIAS_NSAC26-T[0-9]+$';

notify pgrst, 'reload schema';
