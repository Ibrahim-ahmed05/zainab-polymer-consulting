// Run the real migration against an isolated local PostgreSQL WASM runtime.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
const editor = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
try {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth, storage to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id bigint generated always as identity, bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant all on storage.objects to anon, authenticated;
    grant usage on all sequences in schema storage to anon, authenticated;
    -- Mimic permissive default table grants so the migration must restrict them.
    alter default privileges in schema public grant all on tables to anon, authenticated;
    insert into auth.users values ('${editor}', 'father@example.com'), ('${stranger}', 'other@example.com');
  `);
  await db.exec(await fs.readFile("supabase/migrations/202609220001_website_editor.sql", "utf8"));
  await db.exec(`insert into public.site_editors values ('${editor}');`);
  const as = async (role, user = "") => {
    await db.exec(
      `reset role; set role ${role}; select set_config('request.jwt.claim.sub', '${user}', false);`,
    );
  };
  const denied = async (sql) =>
    assert.rejects(db.exec(sql), /permission denied|row-level security|Editor access required/);
  await as("anon");
  assert.equal((await db.query("select * from public.site_published")).rows.length, 0);
  await denied("select * from public.site_drafts");
  await denied("select * from public.site_editors");
  await denied("truncate public.site_published");
  await denied(`select public.save_site_draft('{"version":1}', 0)`);
  await denied(
    `insert into storage.objects(bucket_id,name) values ('site-images','unauthorized.png')`,
  );
  await as("authenticated", stranger);
  assert.equal((await db.query("select * from public.site_editors")).rows.length, 0);
  assert.equal((await db.query("select * from public.site_drafts")).rows.length, 0);
  await denied(`insert into public.site_editors values ('${stranger}')`);
  await denied(`select public.save_site_draft('{"version":1}', 0)`);
  await denied("select public.publish_site_draft(1)");
  await denied(`insert into public.site_published(id,content) values ('main','{"version":1}')`);
  await denied(
    `insert into storage.objects(bucket_id,name) values ('site-images','unauthorized.png')`,
  );
  await denied("truncate public.site_drafts");
  await as("authenticated", editor);
  let result = (
    await db.query(`select public.save_site_draft('{"version":1,"test":"draft"}', 0) as result`)
  ).rows[0].result;
  assert.equal(result.revision, 1);
  assert.equal((await db.query("select * from public.site_published")).rows.length, 0);
  await assert.rejects(
    db.exec(`select public.save_site_draft('{"version":1}', 0)`),
    /changed elsewhere/,
  );
  await assert.rejects(db.exec("select public.publish_site_draft(0)"), /changed elsewhere/);
  await db.exec("select public.publish_site_draft(1)");
  await db.exec(`select public.save_site_draft('{"version":1,"test":"second draft"}', 1)`);
  await db.exec(
    `insert into storage.objects(bucket_id,name) values ('site-images','approved.png')`,
  );
  await denied(`insert into storage.objects(bucket_id,name) values ('other-bucket','wrong.png')`);
  await as("anon");
  assert.equal(
    (await db.query("select content from public.site_published")).rows[0].content.test,
    "draft",
  );
  await denied(`update public.site_published set content = '{"version":1}'`);
  await as("authenticated", editor);
  await db.exec("select public.publish_site_draft(2)");
  await as("anon");
  assert.equal(
    (await db.query("select content from public.site_published")).rows[0].content.test,
    "second draft",
  );
  console.log(
    "PASS: migration, anonymous isolation, non-editor isolation, editor saves/publishes, revision conflicts, draft privacy, storage policies.",
  );
} finally {
  await db.close();
}
