export function streakColor(days: number): string {
  if (days >= 100) return "text-pink-300";
  if (days >= 50) return "text-amber-300";
  if (days >= 28) return "text-violet-300";
  if (days >= 14) return "text-blue-300";
  if (days >= 5) return "text-emerald-300";
  return "text-zinc-200";
}
