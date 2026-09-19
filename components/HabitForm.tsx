"use client";

import { useState, useTransition } from "react";
import { createHabit, updateHabit } from "@/app/actions/habits";
import { HABIT_COLORS } from "@/lib/constants";

type HabitFormProps = {
  mode: "create" | "edit";
  habitId?: string;
  initialName?: string;
  initialColor?: string;
  onDone?: () => void;
};

export default function HabitForm({
  mode,
  habitId,
  initialName = "",
  initialColor = HABIT_COLORS[0],
  onDone,
}: HabitFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createHabit(name, color);
          setName("");
          setColor(HABIT_COLORS[0]);
        } else if (habitId) {
          await updateHabit(habitId, name, color);
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

      {error && <p className="text-sm text-red-400">{error}</p>}

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
