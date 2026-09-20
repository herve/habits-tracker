import { formatDate } from "./dates";
import { isScheduledOn } from "./schedule";

/** Count completed scheduled days; rest days never break a streak. */
export function computeStreak(
  completedDates: Set<string>,
  referenceDate?: string,
  scheduleDays: number[] | null = null,
): number {
  if (scheduleDays?.length === 0) return 0;
  const ref = referenceDate ?? formatDate(new Date());
  let streak = 0;
  const cursor = new Date(`${ref}T12:00:00`);

  if (isScheduledOn(scheduleDays, ref) && !completedDates.has(ref)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const date = formatDate(cursor);
    if (isScheduledOn(scheduleDays, date)) {
      if (!completedDates.has(date)) break;
      streak++;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
