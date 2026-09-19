# Habits Tracker

Minimal dark habit tracker built with Next.js, TypeScript, Tailwind, and Supabase.

## Features (Phase 1)

- Email/password auth
- Add, edit, delete habits
- Daily checkbox per habit
- 14-day history grid
- Streak counter
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
