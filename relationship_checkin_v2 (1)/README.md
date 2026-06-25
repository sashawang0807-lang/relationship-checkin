# Relationship Check-In v2

## Changes

- No access code.
- Two entrance buttons:
  - Jingyi
  - Rodrigo
- 14 final questions.
- Each question collects:
  - Agree / Disagree / Need Discussion
  - Your Thoughts
  - What are you willing to do?
- Dashboard compares latest submitted answers from Jingyi and Rodrigo.
- Dashboard automatically shows:
  - Agreements
  - Need Discussion
  - Major Differences
  - Friday Discussion Summary

## Setup

### 1. Supabase table update

Run the SQL in `supabase_schema_v2.sql`.

This removes `access_code` because v2 does not use it.

### 2. config.js

Replace placeholders with your real Supabase values:

```js
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-publishable-key";
```

Use normal English quotes only.

### 3. GitHub

Replace the old files with these files:

- index.html
- style.css
- app.js
- config.js

Then commit changes.

### 4. Vercel

Vercel should auto-deploy after GitHub commit.

Open the fixed project domain, not a preview link.
