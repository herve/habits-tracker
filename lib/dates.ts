/** Format a Date as YYYY-MM-DD (UTC-safe for daily habits). */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function today(): string {
  return formatDate(new Date());
}

/** Returns the last N days including today, oldest first. */
export function getLastNDays(count: number): string[] {
  const days: string[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    days.push(formatDate(date));
  }

  return days;
}

/** Short label for grid headers, e.g. "Mon 15". */
export function shortLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });
}
