# Relationship Check-In Web App

This is a real web questionnaire that collects answers in Supabase.

## What it does

- Lets Rodrigo fill out answers online.
- Saves his answers to Supabase.
- Lets you view submitted answers using the same access code.
- Collects:
  - agree / disagree / need discussion
  - written opinion
  - practical action he is willing to try
  - final thoughts

## Setup

### 1. Create a Supabase project

Go to Supabase and create a new project.

### 2. Create the table

In Supabase:

SQL Editor > New Query

Paste the content from `supabase_schema.sql` and run it.

### 3. Add Supabase keys

Open `config.js`.

Replace:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

with your real Supabase Project URL and anon public key.

You can find them in:

Project Settings > API

### 4. Deploy to Vercel

Upload this folder to GitHub, then import it into Vercel.

Or drag-and-drop the folder into Netlify.

### 5. Use it

Send Rodrigo the website link and a shared access code.

Example:

```text
Code: friday
```

After he submits, open the same page, click "View submitted answers", and enter the code.
