delete from public.admin_users as admins
where not exists (
  select 1
  from auth.users as users
  where users.id = admins.user_id
    and lower(users.email) = lower('mohdanas@birlainstitute.co.in')
    and users.email_confirmed_at is not null
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
