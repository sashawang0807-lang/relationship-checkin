create table relationship_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  participant_name text not null,
  access_code text not null,
  responses jsonb not null,
  final_thoughts text
);

alter table relationship_responses enable row level security;

create policy "Anyone can insert responses"
on relationship_responses
for insert
to anon
with check (true);

create policy "Anyone can read responses by access code through client filter"
on relationship_responses
for select
to anon
using (true);
