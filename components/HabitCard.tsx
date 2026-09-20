"use client";

import { useState, useTransition, type ReactNode } from "react";
import { deleteHabit, toggleCompletion } from "@/app/actions/habits";
import { today } from "@/lib/dates";
import { isScheduledOn, scheduleLabel } from "@/lib/schedule";
import { streakColor } from "@/lib/streak-style";
import HistoryGrid from "./HistoryGrid";
import HabitForm from "./HabitForm";
import type { HabitWithCompletions } from "@/types/habit";

type HabitCardProps = {
  habit: HabitWithCompletions;
  days: string[];
  dragHandle?: ReactNode;
  historyOpen: boolean;
  onToggleHistory: () => void;
};

export default function HabitCard({ habit, days, dragHandle, historyOpen, onToggleHistory }: HabitCardProps) {
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
      try {
        await deleteHabit(habit.id);
      } catch {
        setError("Could not delete this habit. Please try again.");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-3 transition-colors hover:border-white/15 sm:p-4">
      <div className="flex items-center gap-2">
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
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="min-w-0 break-words text-base font-medium text-zinc-100">{habit.name}</h2>
            <span className="max-w-[45%] shrink-0 text-right text-[11px] leading-4 text-zinc-400">
              {scheduleLabel(habit.schedule_days)}
            </span>
          </div>
        </div>
        <details className="relative shrink-0">
          <summary aria-label={`Options for ${habit.name}`} className="flex h-11 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-xl text-zinc-400 hover:bg-zinc-800 [&::-webkit-details-marker]:hidden">⋯</summary>
          <div className="absolute right-0 top-full z-10 w-32 rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-lg">
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  setIsEditing((value) => !value);
                }}
                className="min-h-11 w-full rounded-md px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  handleDelete();
                }}
                disabled={isPending}
                className="min-h-11 w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-800"
              >
                Delete
              </button>
          </div>
        </details>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2">
        {dragHandle}
        <p className={`min-w-0 flex-1 ${habit.streak === 0 ? "text-sm font-normal" : "text-lg font-medium"} ${streakColor(habit.streak)}`}>
          {habit.streak === 0 ? "Start small today." : `${habit.streak} day streak`}
        </p>
        <button type="button" onClick={onToggleHistory} aria-expanded={historyOpen} aria-controls={`history-${habit.id}`}
          className="min-h-11 rounded-lg px-2 text-xs text-indigo-300 hover:bg-zinc-800">
          History {historyOpen ? "⌃" : "⌄"}
        </button>
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
          ) : null}
          <div id={`history-${habit.id}`} hidden={!historyOpen}>
            <HistoryGrid
              days={days}
              completedDates={completedDates}
              color={habit.color}
              scheduleDays={habit.schedule_days}
            />
          </div>
    </article>
  );
}
