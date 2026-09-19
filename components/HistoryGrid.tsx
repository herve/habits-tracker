import { shortLabel } from "@/lib/dates";

type HistoryGridProps = {
  days: string[];
  completedDates: Set<string>;
  color: string;
};

/** 14-day dot grid — filled when the habit was completed. */
export default function HistoryGrid({
  days,
  completedDates,
  color,
}: HistoryGridProps) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14">
        {days.map((day) => {
          const done = completedDates.has(day);
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-zinc-600">{shortLabel(day)}</span>
              <div
                title={day}
                className="h-3 w-3 rounded-full border border-zinc-700"
                style={{
                  backgroundColor: done ? color : "transparent",
                  borderColor: done ? color : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
