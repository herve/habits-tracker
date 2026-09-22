import { formatDate } from "./dates";
import { isScheduledOn, WEEKDAYS } from "./schedule";
import { computeStreak } from "./streaks";
import type { HabitWithCompletions } from "../types/habit";

function shift(date: string, days: number): string {
  const cursor = new Date(`${date}T12:00:00`);
  cursor.setDate(cursor.getDate() + days);
  return formatDate(cursor);
}

export function computeStats(habits: HabitWithCompletions[], reference: string) {
  const weekday = new Date(`${reference}T12:00:00`).getDay();
  const weekStart = shift(reference, -((weekday + 6) % 7));
  const weekEnd = shift(weekStart, 6);
  const patternStart = shift(reference, -27);
  const monthStart = `${reference.slice(0, 7)}-01`;
  const previousStart = shift(weekStart, -7);
  const previousEnd = shift(reference, -7);
  const daily = Array.from({ length: 28 }, (_, index) => ({ date: shift(patternStart, index), completed: 0, scheduled: 0 }));
  const byDate = new Map(daily.map((day) => [day.date, day]));
  let totalCompleted = 0;
  let monthCompleted = 0;
  let monthScheduled = 0;
  let previousCompleted = 0;
  let previousScheduled = 0;
  const patterns = WEEKDAYS.map(({ value, label }) => ({ weekday: value, label, completed: 0, scheduled: 0 }));
  let completed = 0;
  let scheduled = 0;
  const records = habits.map((habit) => {
    const dates = new Set(habit.completions.filter((entry) => entry.done).map((entry) => entry.date));
    const created = formatDate(new Date(habit.created_at));
    const eligibleDates = new Set([...dates].filter((date) => date >= created && date <= reference));
    let best = 0;
    let running = 0;
    for (let date = created; date <= reference; date = shift(date, 1)) {
      if (!isScheduledOn(habit.schedule_days, date)) continue;
      const done = dates.has(date);
      running = done ? running + 1 : 0;
      best = Math.max(best, running);
      if (done) totalCompleted++;
      if (date >= monthStart) {
        monthScheduled++;
        if (done) monthCompleted++;
      }
      if (date >= previousStart && date <= previousEnd) {
        previousScheduled++;
        if (done) previousCompleted++;
      }
      const point = byDate.get(date);
      if (point) {
        point.scheduled++;
        if (done) point.completed++;
      }
      if (date >= weekStart) {
        scheduled++;
        if (done) completed++;
      }
      if (date >= patternStart) {
        const day = new Date(`${date}T12:00:00`).getDay();
        const pattern = patterns.find((entry) => entry.weekday === day)!;
        pattern.scheduled++;
        if (done) pattern.completed++;
      }
    }
    return { id: habit.id, name: habit.name, best, current: computeStreak(eligibleDates, reference, habit.schedule_days ?? null) };
  });
  return {
    weekStart, weekEnd, patternStart, reference, completed, scheduled,
    percentage: scheduled ? Math.round(completed / scheduled * 100) : null,
    patterns, records, daily, totalCompleted, totalHabits: habits.length,
    activeHabits: habits.filter((habit) => habit.completions.some((entry) => entry.done && entry.date >= patternStart && entry.date <= reference && isScheduledOn(habit.schedule_days, entry.date))).length,
    currentStreak: Math.max(0, ...records.map((record) => record.current)),
    longestStreak: Math.max(0, ...records.map((record) => record.best)),
    month: { start: monthStart, completed: monthCompleted, scheduled: monthScheduled, percentage: monthScheduled ? Math.round(monthCompleted / monthScheduled * 100) : null },
    previousWeek: { start: previousStart, end: previousEnd, completed: previousCompleted, scheduled: previousScheduled, percentage: previousScheduled ? Math.round(previousCompleted / previousScheduled * 100) : null },
  };
}

export type HabitStats = ReturnType<typeof computeStats>;
