-- FIRST create the user in Authentication > Users > Add user > Create new user.
-- Replace this email with the exact email used there, then run this query.
-- Run it again with your own email if you also want dashboard access.
do $$
declare editor_id uuid;
begin
  select id into editor_id from auth.users
  where lower(email) = lower('neaz@zainabpolymers.com');
  if editor_id is null then
    raise exception 'No account found. Create the user in Authentication > Users first, then use that exact email here.';
  end if;
  insert into public.site_editors(user_id) values (editor_id)
  on conflict (user_id) do nothing;
end;
$$;

-- Verify the account has editor access:
select users.email, editors.user_id
from public.site_editors editors
join auth.users users on users.id = editors.user_id;
