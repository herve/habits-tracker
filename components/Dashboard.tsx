"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { reorderHabits } from "@/app/actions/habits";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import type { HabitWithCompletions } from "@/types/habit";

type DashboardProps = {
  habits: HabitWithCompletions[];
  days: string[];
};

export default function Dashboard({ habits, days }: DashboardProps) {
  const [orderedHabits, setOrderedHabits] = useOptimistic(habits);
  const [isSaving, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const listRef = useRef<HTMLElement>(null);

  function targetAt(x: number, y: number) {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-habit-id]");
    return element && listRef.current?.contains(element) ? element.dataset.habitId ?? null : null;
  }

  function moveHabit(id: string, destination: string | null) {
    if (isSaving || !destination || destination === id) return;
    const from = orderedHabits.findIndex((habit) => habit.id === id);
    const to = orderedHabits.findIndex((habit) => habit.id === destination);
    if (from < 0 || to < 0) return;
    const next = [...orderedHabits];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    startTransition(async () => {
      setOrderedHabits(next);
      setMessage("Saving order…");
      try {
        await reorderHabits(next.map((habit) => habit.id));
        setMessage(`${moved.name} moved to position ${to + 1}. Order saved.`);
      } catch {
        setMessage("Could not save order. Your previous order has been restored. Please try again.");
      }
    });
  }

  function cancelDrag() {
    setDragging(null);
    setTarget(null);
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-6">
      <p id="reorder-help" className="text-xs text-zinc-500">
        Drag the grip to reorder habits, or focus it and use the arrow keys.
      </p>
      <p role="status" className="text-sm text-zinc-400">{message}</p>
      <section ref={listRef} aria-label="Habits" className="space-y-3">
        {habits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            No habits yet. Add your first one below.
          </p>
        ) : (
          orderedHabits.map((habit, index) => (
            <div key={habit.id} data-habit-id={habit.id}
              className={`rounded-xl ${dragging === habit.id ? "opacity-50" : ""} ${target === habit.id && target !== dragging ? "ring-2 ring-indigo-400" : ""}`}>
              <HabitCard habit={habit} days={days} dragHandle={
                <button type="button" disabled={isSaving || habits.length < 2}
                  aria-label={`Move ${habit.name}, position ${index + 1} of ${habits.length}`}
                  aria-describedby="reorder-help"
                  className="-ml-2 flex h-8 w-6 shrink-0 touch-none select-none items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-30 cursor-grab active:cursor-grabbing"
                  onPointerDown={(event) => {
                    if (!event.isPrimary || event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(habit.id);
                    setTarget(habit.id);
                  }}
                  onPointerMove={(event) => {
                    if (dragging !== habit.id) return;
                    if (event.clientY < 70) window.scrollBy(0, -16);
                    if (event.clientY > window.innerHeight - 70) window.scrollBy(0, 16);
                    setTarget(targetAt(event.clientX, event.clientY));
                  }}
                  onPointerUp={(event) => {
                    if (dragging === habit.id) moveHabit(habit.id, targetAt(event.clientX, event.clientY));
                    cancelDrag();
                  }}
                  onPointerCancel={cancelDrag}
                  onLostPointerCapture={cancelDrag}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") cancelDrag();
                    if (dragging || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
                    event.preventDefault();
                    moveHabit(habit.id, orderedHabits[index + (event.key === "ArrowUp" ? -1 : 1)]?.id ?? null);
                  }}>
                  <svg aria-hidden="true" viewBox="0 0 16 24" className="h-5 w-4" fill="currentColor">
                    {[6, 12, 18].map((y) => <g key={y}><circle cx="5" cy={y} r="1.5" /><circle cx="11" cy={y} r="1.5" /></g>)}
                  </svg>
                </button>
              } />
            </div>
          ))
        )}
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">New habit</h2>
        <HabitForm mode="create" />
      </section>
    </div>
  );
}
