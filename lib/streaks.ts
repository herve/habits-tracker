import { formatDate } from "./dates";

/** Count consecutive completed days ending today (or yesterday if today is open). */
export function computeStreak(
  completedDates: Set<string>,
  referenceDate?: string,
): number {
  const ref = referenceDate ?? formatDate(new Date());
  let streak = 0;
  const cursor = new Date(`${ref}T12:00:00`);

  if (!completedDates.has(ref)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completedDates.has(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
