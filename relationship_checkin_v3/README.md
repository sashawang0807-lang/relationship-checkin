# Relationship Check-In v3

## Features

- Two entry buttons: Jingyi / Rodrigo
- One question per screen
- 14 questions
- Progress bar
- Auto-save draft to Supabase
- Manual Save Draft button
- Resume draft from Supabase
- Submit sets status to completed
- Dashboard compares latest answers
- Importance rating 1–5
- Dealbreaker checkbox
- Friday Discussion Summary

## Required Supabase SQL

Run this before deployment:

```sql
drop table if exists relationship_responses;

create table relationship_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  participant_name text not null,
  status text not null default 'draft',

  current_question integer default 1,
  responses jsonb not null default '[]'::jsonb,
  final_thoughts text
);

alter table relationship_responses enable row level security;

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

create policy "Anyone can update responses"
on relationship_responses
for update
to anon
using (true)
with check (true);
```

## Setup

1. Replace `config.js` values.
2. Upload all files in this folder to Netlify.
3. Do not upload the outer folder. Upload the files inside:
   - index.html
   - style.css
   - app.js
   - config.js
   - README.md
4. Force refresh the website.
