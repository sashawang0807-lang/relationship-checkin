-- Run this if your current table still has access_code set as NOT NULL.
-- This updates the table for v2 with no access code.

alter table relationship_responses
drop column if exists access_code;

-- If you are starting from scratch, this table definition is enough:
-- create table relationship_responses (
--   id uuid primary key default gen_random_uuid(),
--   created_at timestamp with time zone default now(),
--   participant_name text not null,
--   responses jsonb not null,
--   final_thoughts text
-- );

alter table relationship_responses enable row level security;

drop policy if exists "Anyone can insert responses" on relationship_responses;
drop policy if exists "Anyone can read responses" on relationship_responses;
drop policy if exists "Anyone can read responses by access code through client filter" on relationship_responses;

create policy "Anyone can insert responses"
on relationship_responses
for insert
to anon
with check (true);

create policy "Anyone can read responses"
on relationship_responses
for select
to anon
using (true);
