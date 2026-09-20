"use client";

import { useState, useTransition, type ReactNode } from "react";
import { deleteHabit, toggleCompletion } from "@/app/actions/habits";
import { today } from "@/lib/dates";
import { isScheduledOn, scheduleLabel } from "@/lib/schedule";
import HistoryGrid from "./HistoryGrid";
import HabitForm from "./HabitForm";
import type { HabitWithCompletions } from "@/types/habit";

type HabitCardProps = {
  habit: HabitWithCompletions;
  days: string[];
  dragHandle?: ReactNode;
};

export default function HabitCard({ habit, days, dragHandle }: HabitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [animateCompletion, setAnimateCompletion] = useState(false);
  const [error, setError] = useState("");

  const completedDates = new Set(
    habit.completions.filter((c) => c.done).map((c) => c.date),
  );
  const isDoneToday = completedDates.has(today());
  const scheduledToday = isScheduledOn(habit.schedule_days, today());

  function handleToggle() {
    startTransition(async () => {
      setError("");
      try {
        await toggleCompletion(habit.id, today(), !isDoneToday);
        setAnimateCompletion(!isDoneToday);
      } catch {
        setError("Could not update this habit. Please try again.");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.name}"?`)) return;

    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  }

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5 shadow-sm transition-colors hover:border-white/15 sm:p-6">
      <div className="flex items-start gap-3">
        {dragHandle}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending || (!scheduledToday && !isDoneToday)}
          aria-label={isDoneToday ? "Mark as not done" : scheduledToday ? "Mark as done" : "Not scheduled today"}
          aria-pressed={isDoneToday}
          onAnimationEnd={() => setAnimateCompletion(false)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300 ${animateCompletion ? "habit-completed" : ""}`}
          style={{
            backgroundColor: isDoneToday ? habit.color : "transparent",
            borderColor: isDoneToday ? habit.color : "#52525b",
          }}
        >
          {isDoneToday && (
            <svg
              viewBox="0 0 16 16"
              className="h-5 w-5 text-white"
              fill="currentColor"
            >
              <path d="M6.173 11.414 3.05 8.293a1 1 0 0 1 1.414-1.414L6.5 8.915l5.036-5.036a1 1 0 1 1 1.414 1.414L7.207 12.828a1 1 0 0 1-1.414 0Z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <div>
              <h2 className="break-words text-lg font-semibold tracking-tight text-zinc-100">{habit.name}</h2>
              <p className="mt-1 text-xs text-zinc-400">
                {habit.streak} day streak
              </p>
              <p className="mt-1 text-xs text-indigo-300/80">
                {scheduleLabel(habit.schedule_days)}{!scheduledToday && " · Rest day"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setIsEditing((value) => !value)}
                className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-md px-2 py-1 text-xs text-red-400 hover:bg-zinc-800"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
          {isEditing ? (
            <div className="mt-3">
              <HabitForm
                mode="edit"
                habitId={habit.id}
                initialName={habit.name}
                initialColor={habit.color}
                initialScheduleDays={habit.schedule_days}
                onDone={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <HistoryGrid
              days={days}
              completedDates={completedDates}
              color={habit.color}
              scheduleDays={habit.schedule_days}
            />
          )}
    </article>
  );
}
