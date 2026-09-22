import { computeStats, type HabitStats } from "@/lib/stats";
import type { HabitWithCompletions } from "@/types/habit";
import ProgressRing from "./ProgressRing";

function dateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Trend({ stats }: { stats: HabitStats }) {
  const points = stats.daily.map((day, index) => ({ ...day, x: 10 + index * 10, y: day.scheduled ? 90 - day.completed / day.scheduled * 80 : null }));
  const path = points.map((point, index) => point.y === null ? "" : `${index === 0 || points[index - 1].y === null ? "M" : "L"}${point.x},${point.y}`).join(" ");
  return <section className="min-w-0 rounded-xl border border-white/5 p-4">
    <h3 className="text-sm font-medium text-zinc-200">Completion trend</h3>
    <p className="mt-1 text-xs text-zinc-400">Daily completion % · last 4 weeks</p>
    <div className="mt-3 flex gap-2">
      <div aria-hidden="true" className="flex flex-col justify-between py-2 text-[11px] text-zinc-500"><span>100%</span><span>0%</span></div>
      <svg viewBox="0 0 290 100" className="h-28 min-w-0 flex-1" preserveAspectRatio="none" role="img" aria-label="Daily completion percentage over the last 28 days. Exact values are available below.">
        <path d="M10 10H280 M10 90H280" stroke="currentColor" className="text-zinc-800" fill="none" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="text-indigo-400" />
        {points.filter((point) => point.y !== null).map((point) => <circle key={point.date} cx={point.x} cy={point.y!} r="2" className="fill-indigo-300"><title>{dateLabel(point.date)}: {point.completed}/{point.scheduled}</title></circle>)}
      </svg>
    </div>
    <div className="flex justify-between text-[11px] text-zinc-500"><span>{dateLabel(stats.patternStart)}</span><span>{dateLabel(stats.reference)}</span></div>
    <details className="mt-3 text-xs text-zinc-400"><summary className="cursor-pointer py-1">Daily values</summary><ul className="mt-2 grid grid-cols-2 gap-2">{stats.daily.map((day) => <li key={day.date}>{dateLabel(day.date)} · {day.scheduled ? `${Math.round(day.completed / day.scheduled * 100)}% (${day.completed}/${day.scheduled})` : "Rest day"}</li>)}</ul></details>
  </section>;
}

export default function DashboardMetrics({ habits, reference, expanded = false }: { habits: HabitWithCompletions[]; reference: string; expanded?: boolean }) {
  const stats = computeStats(habits, reference);
  const delta = stats.percentage !== null && stats.previousWeek.percentage !== null ? stats.percentage - stats.previousWeek.percentage : null;
  const weekly = stats.daily.filter((day) => day.date >= stats.weekStart);
  const maxActivity = Math.max(1, ...weekly.map((day) => day.completed));
  const metrics = [
    { label: "Completed", value: stats.totalCompleted, note: "All-time check-ins" },
    { label: "Current streak", value: `${stats.currentStreak}d`, note: "Best ongoing habit" },
    { label: "Longest streak", value: `${stats.longestStreak}d`, note: "All-time habit record" },
    { label: "Active habits", value: `${stats.activeHabits}/${stats.totalHabits}`, note: "Completed in last 28 days" },
  ];
  return <section aria-label="Your dashboard metrics" className="space-y-3">
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="min-w-0 rounded-xl border border-white/[0.07] bg-zinc-900/60 p-3">
      <dt className="text-xs text-zinc-400">{metric.label}</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-100">{metric.value}</dd><dd className="mt-1 text-[11px] leading-4 text-zinc-500">{metric.note}</dd>
    </div>)}</dl>
    <details open={expanded} className="rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-4">
      <summary className="cursor-pointer text-sm text-zinc-300">Progress & trends <span className="ml-2 text-xs text-indigo-300">{stats.percentage === null ? "No check-ins due this week" : `${stats.percentage}% this week`}</span></summary>
      <div className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">{[
          { label: "Weekly progress", value: stats.percentage, done: stats.completed, due: stats.scheduled, note: "Monday through today" },
          { label: "Monthly progress", value: stats.month.percentage, done: stats.month.completed, due: stats.month.scheduled, note: `${dateLabel(stats.month.start)} through today` },
        ].map((period) => <div key={period.label} className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3"><ProgressRing value={period.value} label={period.label} /><div className="min-w-0"><h3 className="text-sm text-zinc-200">{period.label}</h3><p className="text-xs text-zinc-400">{period.done} / {period.due} scheduled</p><p className="mt-1 text-[11px] text-zinc-500">{period.note}</p></div></div>)}</div>
        <p className="text-sm text-zinc-300">{delta === null ? "Not enough scheduled history to compare weeks." : delta === 0 ? "On par with last week." : `${delta > 0 ? "+" : ""}${delta} percentage points vs last week.`}<span className="mt-1 block text-xs text-zinc-500">Same weekdays compared: {dateLabel(stats.previousWeek.start)}–{dateLabel(stats.previousWeek.end)} vs {dateLabel(stats.weekStart)}–{dateLabel(stats.reference)}.</span></p>
        <Trend stats={stats} />
        <section className="rounded-xl border border-white/5 p-4"><h3 className="text-sm font-medium text-zinc-200">Weekly activity</h3><p className="mt-1 text-xs text-zinc-400">Completed check-ins · Monday–Sunday</p>
          <div className="mt-4 grid grid-cols-7 gap-2">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => {
            const day = weekly[index];
            return <div key={label} className="min-w-0 text-center" aria-label={`${label}: ${day ? `${day.completed} completed of ${day.scheduled} scheduled` : "upcoming"}`}><span className="text-xs tabular-nums text-zinc-300">{day ? day.completed : "—"}</span><div className="mt-1 flex h-20 items-end justify-center"><div className={`w-full max-w-6 rounded-t ${day ? "bg-indigo-400" : "bg-zinc-800"}`} style={{ height: day ? `${Math.max(2, day.completed / maxActivity * 100)}%` : "2%" }} /></div><span className="mt-2 block text-[11px] text-zinc-400">{label}</span></div>;
          })}</div>
        </section>
        <p className="text-xs leading-5 text-zinc-500">The goal is to complete all scheduled check-ins due so far. Future days and rest days are excluded. Streaks count scheduled days; changing a schedule recalculates past metrics.</p>
      </div>
    </details>
  </section>;
}
