import AppShell from "@/components/AppShell";
import StatsSummary from "@/components/StatsSummary";
import DashboardMetrics from "@/components/DashboardMetrics";
import { loadHabits } from "@/lib/load-habits";
import { today } from "@/lib/dates";
import { computeStats } from "@/lib/stats";
import { streakColor } from "@/lib/streak-style";

export default async function StatsPage() {
  const habits = await loadHabits(false);
  const reference = today();
  const stats = computeStats(habits, reference);
  return <AppShell active="stats">
    <main className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div><h2 className="text-xl font-semibold text-zinc-100">Your progress</h2><p className="mt-1 text-sm text-zinc-400">Small steps, seen over time.</p></div>
      <DashboardMetrics habits={habits} reference={reference} expanded />
      <StatsSummary stats={stats} showWeekly={false} />
      <section className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-4">
        <h3 className="font-medium text-zinc-100">Personal best streaks</h3>
        <p className="mt-1 text-xs text-zinc-400">All time · consecutive scheduled days</p>
        {stats.records.length === 0 ? <p className="mt-4 text-sm text-zinc-400">Add a habit to start your first streak.</p> :
          <ul className="mt-3 divide-y divide-zinc-800">{stats.records.map((record) => <li key={record.id} className="flex items-center justify-between gap-4 py-3">
            <span className="min-w-0 break-words text-sm text-zinc-300">{record.name}</span>
            <span className={`shrink-0 text-lg font-medium ${streakColor(record.best)}`}>{record.best} {record.best === 1 ? "day" : "days"}</span>
          </li>)}</ul>}
      </section>
      <p className="text-xs leading-5 text-zinc-500">Only scheduled days since each habit was created count. Today is included; future days are excluded. Stats use your current schedule, so changing it recalculates past results.</p>
    </main>
  </AppShell>;
}
