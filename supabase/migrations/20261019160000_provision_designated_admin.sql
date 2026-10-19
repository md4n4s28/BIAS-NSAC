insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('mohdanas@birlainstitute.co.in')
  and email_confirmed_at is not null
on conflict (user_id) do nothing;

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
