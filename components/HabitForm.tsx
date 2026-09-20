"use client";

import { useState, useTransition } from "react";
import { createHabit, updateHabit } from "@/app/actions/habits";
import { HABIT_COLORS } from "@/lib/constants";
import { WEEKDAYS } from "@/lib/schedule";

type HabitFormProps = {
  mode: "create" | "edit";
  habitId?: string;
  initialName?: string;
  initialColor?: string;
  initialScheduleDays?: number[] | null;
  onDone?: () => void;
};

export default function HabitForm({
  mode,
  habitId,
  initialName = "",
  initialColor = HABIT_COLORS[0],
  initialScheduleDays = null,
  onDone,
}: HabitFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [scheduleMode, setScheduleMode] = useState(initialScheduleDays == null ? "daily" : "specific");
  const [selectedDays, setSelectedDays] = useState<number[]>(initialScheduleDays ?? [1, 2, 3, 4, 5]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (scheduleMode === "specific" && selectedDays.length === 0) {
      setError("Choose at least one day.");
      return;
    }
    const scheduleDays = scheduleMode === "daily" ? null : selectedDays;

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createHabit(name, color, scheduleDays);
          setName("");
          setColor(HABIT_COLORS[0]);
          setScheduleMode("daily");
          setSelectedDays([1, 2, 3, 4, 5]);
        } else if (habitId) {
          await updateHabit(habitId, name, color, scheduleDays);
        }
        onDone?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Habit name"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
      />

      <div className="flex flex-wrap gap-2">
        {HABIT_COLORS.map((option) => (
          <button
            key={option}
            type="button"
            aria-label={`Color ${option}`}
            onClick={() => setColor(option)}
            className="h-7 w-7 rounded-full border-2 transition"
            style={{
              backgroundColor: option,
              borderColor: color === option ? "#fafafa" : "transparent",
            }}
          />
        ))}
      </div>

      <fieldset disabled={isPending} className="space-y-3">
        <legend className="mb-2 text-sm text-zinc-300">Schedule</legend>
        <div className="flex gap-2">
          {[{ value: "daily", label: "Daily" }, { value: "specific", label: "Specific days" }].map((option) => (
            <button key={option.value} type="button" aria-pressed={scheduleMode === option.value}
              onClick={() => setScheduleMode(option.value)}
              className={`rounded-lg border px-3 py-2 text-sm ${scheduleMode === option.value ? "border-indigo-400/50 bg-indigo-400/10 text-indigo-200" : "border-zinc-700 text-zinc-400"}`}>
              {option.label}
            </button>
          ))}
        </div>
        {scheduleMode === "specific" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Scheduled weekdays">
            {WEEKDAYS.map((day) => (
              <button key={day.value} type="button" aria-pressed={selectedDays.includes(day.value)}
                onClick={() => setSelectedDays((previous) => previous.includes(day.value) ? previous.filter((value) => value !== day.value) : [...previous, day.value])}
                className={`min-h-10 min-w-10 rounded-lg border px-2 text-xs ${selectedDays.includes(day.value) ? "border-indigo-400/50 bg-indigo-400/10 text-indigo-200" : "border-zinc-700 text-zinc-400"}`}>
                {day.label}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : mode === "create"
            ? "Add habit"
            : "Save changes"}
      </button>
    </form>
  );
}
