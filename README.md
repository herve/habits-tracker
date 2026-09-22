# Habits Tracker

Minimal dark habit tracker built with Next.js, TypeScript, Tailwind, and Supabase.

## Features (Phase 1)

- Email/password auth
- Profile pictures support device uploads (JPG/PNG/WebP, 2 MB maximum), emoji selection and removal. Run `supabase/migrations/20260922_avatars.sql` for the Storage bucket and owner-only upload/delete policies. Avatar files have public read URLs; use them only for pictures intended to be visible. URLs/emoji values are saved in user metadata.
- Profile page with account details, avatar presets, editable display name, activity summary, and account-synced preferences for motivation messages and rest-day visibility. No additional database migration required.
- Add, edit, delete habits
- Drag habits by their grip to reorder (mouse or touch), or focus the grip and use the arrow keys. Order is saved in your account metadata.
- Daily checkbox per habit
- 8-day history grid
- Daily or specific-weekday schedules; rest days are excluded from today's progress and do not break streaks. Editing a schedule recalculates history and streaks using the new schedule while preserving completions.
- Streak counter
- Compact dashboard metrics with daily goal ring, completed check-ins, active/total habits, current and record streaks; expandable weekly/monthly rings, a 28-day trend and weekly activity bars. Week comparisons use matching elapsed weekdays. All metrics are personal; platform user counts require a separate authorized admin data source.
- Stats page and per-habit History stats: Monday–Sunday weekly completion, all-time best streaks, and weekday patterns over the last 28 days. Only scheduled days since creation through today count. Past statistics use the current schedule.
- Default habits on first login

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Go to **Authentication → Providers** and enable **Email**
4. Copy **Project URL** and **anon public key** from **Settings → API**

### 3. Environment variables

For an existing database, run `supabase/migrations/20260920_habit_schedules.sql` in the Supabase SQL Editor before deploying schedule support. Existing habits remain daily.

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

1. Push this repo to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the same env vars in **Project Settings → Environment Variables**
4. Deploy

## Project structure

```
app/
  page.tsx          # Dashboard (server)
  login/page.tsx    # Auth page
  actions/habits.ts # Server actions (CRUD)
components/         # UI components
lib/
  supabase/         # Supabase clients
  dates.ts          # Date helpers
  streaks.ts        # Streak logic
supabase/schema.sql # Database setup
```
