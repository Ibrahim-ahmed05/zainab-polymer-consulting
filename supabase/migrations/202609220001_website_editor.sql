-- Run once in your Supabase SQL Editor. No service-role key is used by the website.
begin;

create table public.site_editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_editors enable row level security;
revoke all on public.site_editors from public, anon, authenticated;
grant select on public.site_editors to authenticated;
revoke all on public.site_editors from anon;
revoke insert, update, delete on public.site_editors from authenticated;
create policy "Editors can check their own access" on public.site_editors
  for select to authenticated using (user_id = (select auth.uid()));

create table public.site_drafts (
  id text primary key check (id = 'main'),
  content jsonb not null check (jsonb_typeof(content) = 'object' and content->>'version' = '1'),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
create table public.site_published (
  id text primary key check (id = 'main'),
  content jsonb not null check (jsonb_typeof(content) = 'object' and content->>'version' = '1'),
  published_at timestamptz not null default now()
);
alter table public.site_drafts enable row level security;
alter table public.site_published enable row level security;
revoke all on public.site_drafts, public.site_published from public, anon, authenticated;
revoke all on public.site_drafts from anon;
grant select, insert, update on public.site_drafts to authenticated;
grant select on public.site_published to anon, authenticated;
grant insert, update on public.site_published to authenticated;
revoke delete on public.site_drafts, public.site_published from authenticated;
create policy "Editors manage drafts" on public.site_drafts for all to authenticated
  using (exists (select 1 from public.site_editors where user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_editors where user_id = (select auth.uid())));
create policy "Visitors read published content" on public.site_published for select to anon, authenticated using (true);
create policy "Editors insert published content" on public.site_published for insert to authenticated
  with check (exists (select 1 from public.site_editors where user_id = (select auth.uid())));
create policy "Editors update published content" on public.site_published for update to authenticated
  using (exists (select 1 from public.site_editors where user_id = (select auth.uid())))
  with check (exists (select 1 from public.site_editors where user_id = (select auth.uid())));

-- Revision checks prevent one editing session from silently overwriting another.
create function public.save_site_draft(new_content jsonb, expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_revision bigint; saved_revision bigint; saved_time timestamptz;
begin
  if not exists (select 1 from public.site_editors where user_id = auth.uid()) then
    raise exception 'Editor access required';
  end if;
  perform pg_advisory_xact_lock(9222026);
  select revision into current_revision from public.site_drafts where id = 'main' for update;
  if coalesce(current_revision, 0) <> expected_revision then raise exception 'Content changed elsewhere'; end if;
  insert into public.site_drafts(id, content, revision, updated_at)
    values ('main', new_content, 1, now())
    on conflict (id) do update set content = excluded.content, revision = site_drafts.revision + 1, updated_at = now()
    returning revision, updated_at into saved_revision, saved_time;
  return jsonb_build_object('revision', saved_revision, 'updated_at', saved_time);
end;
$$;
create function public.publish_site_draft(expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare draft public.site_drafts; published_time timestamptz;
begin
  if not exists (select 1 from public.site_editors where user_id = auth.uid()) then
    raise exception 'Editor access required';
  end if;
  perform pg_advisory_xact_lock(9222026);
  select * into draft from public.site_drafts where id = 'main' for update;
  if draft.id is null or draft.revision <> expected_revision then raise exception 'Content changed elsewhere'; end if;
  insert into public.site_published(id, content, published_at) values ('main', draft.content, now())
    on conflict (id) do update set content = excluded.content, published_at = excluded.published_at
    returning published_at into published_time;
  return jsonb_build_object('published_at', published_time);
end;
$$;
revoke all on function public.save_site_draft(jsonb, bigint), public.publish_site_draft(bigint) from public, anon;
grant execute on function public.save_site_draft(jsonb, bigint), public.publish_site_draft(bigint) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
create policy "Editors upload website photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and exists (select 1 from public.site_editors where user_id = (select auth.uid())));
-- Public bucket allows reading image URLs; no public upload/update/delete policy.
commit;
