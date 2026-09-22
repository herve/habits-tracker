import StatsSummary from "./StatsSummary";
import { computeStats } from "@/lib/stats";
import { streakColor } from "@/lib/streak-style";
import type { HabitWithCompletions } from "@/types/habit";

export default function HabitStats({ habit, reference }: { habit: HabitWithCompletions; reference: string }) {
  const stats = computeStats([habit], reference);
  const best = stats.records[0].best;
  return <div className="mt-5 space-y-4 border-t border-white/5 pt-4">
    <div className="flex items-baseline justify-between gap-3"><h3 className="text-sm text-zinc-400">Personal best</h3><span className={`text-lg font-medium ${streakColor(best)}`}>{best} {best === 1 ? "day" : "days"}</span></div>
    <StatsSummary stats={stats} />
    <p className="text-xs text-zinc-500">Based on your current schedule, from the day you created this habit.</p>
  </div>;
}
