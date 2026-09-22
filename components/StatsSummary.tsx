import type { HabitStats } from "@/lib/stats";

function label(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function StatsSummary({ stats, showWeekly = true }: { stats: HabitStats; showWeekly?: boolean }) {
  return (
    <div className="space-y-6">
      {showWeekly && <section aria-label="Weekly completion" className="rounded-xl bg-indigo-400/10 p-4">
        <h3 className="text-sm font-medium text-indigo-200">This week · Mon–Sun</h3>
        <p className="mt-1 text-xs text-zinc-400">{label(stats.weekStart)} – {label(stats.weekEnd)} · through {label(stats.reference)}</p>
        <p className="mt-3 text-2xl font-semibold text-zinc-100">{stats.percentage === null ? "—" : `${stats.percentage}%`}</p>
        <p className="mt-1 text-sm text-zinc-400">{stats.scheduled ? `${stats.completed} of ${stats.scheduled} scheduled check-ins completed` : "No scheduled check-ins yet this week."}</p>
        {stats.percentage !== null && <div role="progressbar" aria-label="Weekly completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.percentage} className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-400" style={{ width: `${stats.percentage}%` }} />
        </div>}
      </section>}
      <section aria-label="Weekday patterns">
        <h3 className="text-sm font-medium text-zinc-200">Weekday patterns · last 4 weeks</h3>
        <p className="mt-1 text-xs text-zinc-400">{label(stats.patternStart)} – {label(stats.reference)} · completed / scheduled</p>
        <div className="mt-3 space-y-2">
          {stats.patterns.map((day) => {
            const rate = day.scheduled ? Math.round(day.completed / day.scheduled * 100) : null;
            return <div key={day.weekday} className="flex items-center gap-3 text-xs" aria-label={`${day.label}: ${rate === null ? "not scheduled" : `${rate}%, ${day.completed} of ${day.scheduled} completed`}`}>
              <span className="w-7 shrink-0 text-zinc-300">{day.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${rate ?? 0}%` }} /></div>
              <span className="w-10 text-right tabular-nums text-zinc-300">{rate === null ? "—" : `${rate}%`}</span>
              <span className="w-12 text-right tabular-nums text-zinc-500">{day.completed}/{day.scheduled}</span>
            </div>;
          })}
        </div>
      </section>
    </div>
  );
}
