drop policy if exists team_queries_admin_delete on public.team_queries;
create policy team_queries_admin_delete
on public.team_queries for delete
to authenticated
using (public.is_admin());

grant delete on public.team_queries to authenticated;

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

revoke all on function public.audit_team_query_delete() from public, anon, authenticated;
