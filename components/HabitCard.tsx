"use client";

import { useState, useTransition, type ReactNode } from "react";
import { deleteHabit, toggleCompletion } from "@/app/actions/habits";
import { today } from "@/lib/dates";
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

  const completedDates = new Set(
    habit.completions.filter((c) => c.done).map((c) => c.date),
  );
  const isDoneToday = completedDates.has(today());

  function handleToggle() {
    startTransition(async () => {
      await toggleCompletion(habit.id, today(), !isDoneToday);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${habit.name}"?`)) return;

    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  }

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start gap-3">
        {dragHandle}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          aria-label={isDoneToday ? "Mark as not done" : "Mark as done"}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition disabled:opacity-50"
          style={{
            backgroundColor: isDoneToday ? habit.color : "transparent",
            borderColor: isDoneToday ? habit.color : "#52525b",
          }}
        >
          {isDoneToday && (
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5 text-white"
              fill="currentColor"
            >
              <path d="M6.173 11.414 3.05 8.293a1 1 0 0 1 1.414-1.414L6.5 8.915l5.036-5.036a1 1 0 1 1 1.414 1.414L7.207 12.828a1 1 0 0 1-1.414 0Z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-medium text-zinc-100">{habit.name}</h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {habit.streak} day streak
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

          {isEditing ? (
            <div className="mt-3">
              <HabitForm
                mode="edit"
                habitId={habit.id}
                initialName={habit.name}
                initialColor={habit.color}
                onDone={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <HistoryGrid
              days={days}
              completedDates={completedDates}
              color={habit.color}
            />
          )}
        </div>
      </div>
    </article>
  );
}
