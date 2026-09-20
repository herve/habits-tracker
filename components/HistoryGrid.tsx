import { isScheduledOn } from "@/lib/schedule";

type HistoryGridProps = {
  days: string[];
  completedDates: Set<string>;
  color: string;
  scheduleDays?: number[] | null;
};

/** 8-day dot grid — filled when the habit was completed. */
export default function HistoryGrid({
  days,
  completedDates,
  color,
  scheduleDays,
}: HistoryGridProps) {
  return (
    <div className="mt-5 overflow-x-auto border-t border-white/5 pt-4">
      <div className="grid min-w-56 grid-cols-8 gap-1">
        {days.map((day) => {
          const done = completedDates.has(day);
          const scheduled = isScheduledOn(scheduleDays, day);
          const date = new Date(`${day}T12:00:00`);
          const isToday = day === days.at(-1);
          return (
            <div key={day} className={`flex flex-col items-center gap-2 rounded-lg py-2 ${isToday ? "bg-indigo-400/10 ring-1 ring-inset ring-indigo-400/20" : ""}`}>
              <time dateTime={day} aria-current={isToday ? "date" : undefined} className={`flex flex-col items-center text-[10px] leading-4 ${isToday ? "font-medium text-indigo-200" : "text-zinc-400"}`}>
                <span>{date.getDate()}</span>
                <span className="whitespace-nowrap">{isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" })}</span>
              </time>
              {!scheduled && !done ? (
                <span title={`${day}: Rest day`} aria-label={`${day}: Rest day`} className="flex h-3 w-3 items-center justify-center text-xs text-zinc-600">–</span>
              ) : <div
                title={`${day}: ${done ? "Completed" : "Not completed"}`}
                className="h-3 w-3 rounded-full border border-zinc-700"
                style={{
                  backgroundColor: done ? color : "transparent",
                  borderColor: done ? color : undefined,
                }}
              />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
