-- Run this in Supabase → SQL Editor

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

create table if not exists public.completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  done boolean not null default true,
  unique (habit_id, date)
);

alter table public.habits enable row level security;
alter table public.completions enable row level security;

create policy "Users manage own habits"
  on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own completions"
  on public.completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists completions_habit_date_idx on public.completions(habit_id, date);
