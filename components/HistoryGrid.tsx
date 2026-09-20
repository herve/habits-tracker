type HistoryGridProps = {
  days: string[];
  completedDates: Set<string>;
  color: string;
};

/** 8-day dot grid — filled when the habit was completed. */
export default function HistoryGrid({
  days,
  completedDates,
  color,
}: HistoryGridProps) {
  return (
    <div className="mt-3 overflow-x-auto">
      <div className="grid min-w-56 grid-cols-8 gap-1.5">
        {days.map((day) => {
          const done = completedDates.has(day);
          const date = new Date(`${day}T12:00:00`);
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <time dateTime={day} className="flex flex-col items-center text-[10px] leading-4 text-zinc-600">
                <span>{date.getDate()}</span>
                <span className="whitespace-nowrap">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
              </time>
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
