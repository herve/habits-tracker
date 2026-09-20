export const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

/** null means every day; weekdays use JavaScript's Sunday=0 convention. */
export function normalizeSchedule(days: number[] | null): number[] | null {
  if (days === null) return null;
  if (!Array.isArray(days) || days.length === 0 || days.length > 7 ||
      days.some((day) => !Number.isInteger(day) || day < 0 || day > 6) ||
      new Set(days).size !== days.length) {
    throw new Error("Choose at least one day, with no duplicates.");
  }
  return days.length === 7 ? null : [...days].sort((a, b) => a - b);
}

export function isScheduledOn(days: number[] | null | undefined, date: string): boolean {
  return days == null || days.includes(new Date(`${date}T12:00:00`).getDay());
}

export function scheduleLabel(days: number[] | null | undefined): string {
  return days == null || days.length === 7
    ? "Daily"
    : WEEKDAYS.filter((day) => days.includes(day.value)).map((day) => day.label).join(", ");
}
