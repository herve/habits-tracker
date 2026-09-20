-- Run once in Supabase SQL Editor before deploying habit schedules.
-- Existing habits remain daily (NULL). 0 = Sunday, 6 = Saturday.
alter table public.habits
  add column if not exists schedule_days integer[] default null
  constraint habits_schedule_days_check check (
    schedule_days is null or (
      cardinality(schedule_days) between 1 and 7
      and schedule_days <@ array[0,1,2,3,4,5,6]
      and array_position(schedule_days, null) is null
    )
  );
