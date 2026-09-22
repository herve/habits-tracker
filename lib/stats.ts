import { formatDate } from "./dates";
import { isScheduledOn, WEEKDAYS } from "./schedule";
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
  const patterns = WEEKDAYS.map(({ value, label }) => ({ weekday: value, label, completed: 0, scheduled: 0 }));
  let completed = 0;
  let scheduled = 0;
  const records = habits.map((habit) => {
    const dates = new Set(habit.completions.filter((entry) => entry.done).map((entry) => entry.date));
    const created = formatDate(new Date(habit.created_at));
    let best = 0;
    let running = 0;
    for (let date = created; date <= reference; date = shift(date, 1)) {
      if (!isScheduledOn(habit.schedule_days, date)) continue;
      const done = dates.has(date);
      running = done ? running + 1 : 0;
      best = Math.max(best, running);
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
    return { id: habit.id, name: habit.name, best };
  });
  return {
    weekStart, weekEnd, patternStart, reference, completed, scheduled,
    percentage: scheduled ? Math.round(completed / scheduled * 100) : null,
    patterns, records,
  };
}

export type HabitStats = ReturnType<typeof computeStats>;
