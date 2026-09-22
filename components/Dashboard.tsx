"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { reorderHabits } from "@/app/actions/habits";
import { isScheduledOn } from "@/lib/schedule";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import ProgressRing from "./ProgressRing";
import type { HabitWithCompletions } from "@/types/habit";

type DashboardProps = {
  habits: HabitWithCompletions[];
  days: string[];
  showMotivation?: boolean;
  expandRestDays?: boolean;
};

export default function Dashboard({ habits, days, showMotivation = true, expandRestDays = false }: DashboardProps) {
  const [orderedHabits, setOrderedHabits] = useOptimistic(habits);
  const [isSaving, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [showNotToday, setShowNotToday] = useState(expandRestDays);
  const listId = useId();
  const scheduledHabits = habits.filter((habit) => isScheduledOn(habit.schedule_days, days.at(-1)!));
  const completedCount = scheduledHabits.filter((habit) =>
    habit.completions.some((completion) => completion.done && completion.date === days.at(-1)),
  ).length;
  const progress = scheduledHabits.length ? Math.round(completedCount / scheduledHabits.length * 100) : 0;
  const groups = [
    orderedHabits.filter((habit) => isScheduledOn(habit.schedule_days, days.at(-1)!)),
    orderedHabits.filter((habit) => !isScheduledOn(habit.schedule_days, days.at(-1)!)),
  ];

  function targetAt(x: number, y: number) {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-habit-id]");
    return element?.closest("[data-habit-list]")?.id === listId ? element.dataset.habitId ?? null : null;
  }

  function moveHabit(id: string, destination: string | null) {
    if (isSaving || !destination || destination === id) return;
    const from = orderedHabits.findIndex((habit) => habit.id === id);
    const to = orderedHabits.findIndex((habit) => habit.id === destination);
    if (from < 0 || to < 0) return;
    if (isScheduledOn(orderedHabits[from].schedule_days, days.at(-1)!) !==
        isScheduledOn(orderedHabits[to].schedule_days, days.at(-1)!)) return;
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
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-8 sm:py-10">
      <section aria-labelledby="daily-progress" className="rounded-2xl border border-indigo-300/10 bg-gradient-to-br from-indigo-500/10 to-zinc-900/50 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="daily-progress" className="text-sm font-medium text-indigo-200">Today’s progress</h2>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{completedCount} <span className="text-base font-normal text-zinc-400">of {scheduledHabits.length} completed</span></p>
          </div>
          <ProgressRing value={scheduledHabits.length ? progress : null} label="Today's goal" />
        </div>
        {showMotivation && <p className="mt-3 text-sm text-zinc-400" aria-live="polite">
          {habits.length === 0 ? "A small habit is a good place to start." : scheduledHabits.length === 0 ? "No habits scheduled today. Enjoy your rest day." : completedCount === scheduledHabits.length ? "All done for today. Enjoy the feeling." : completedCount === 0 ? "One small step at a time." : "You’re making time for yourself. Keep going."}
        </p>}
      </section>
      <p id="reorder-help" className="sr-only">
        Drag the grip to reorder habits, or focus it and use the arrow keys.
      </p>
      <p role="status" className={message ? "text-sm text-zinc-400" : "sr-only"}>{message}</p>
      <section id={listId} data-habit-list aria-label="Habits" className="space-y-4">
        {habits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            No habits yet. Add your first one below.
          </p>
        ) : (
          groups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {groupIndex === 0 ? (
                <h2 className="flex justify-between text-sm text-zinc-400"><span>Today</span><span>{group.length} habits</span></h2>
              ) : group.length > 0 ? (
                <button type="button" aria-expanded={showNotToday} aria-controls="not-today-habits"
                  onClick={() => { setShowNotToday((value) => !value); setOpenHistoryId(null); }}
                  className="flex min-h-11 w-full items-center justify-between rounded-lg text-sm text-zinc-400 hover:text-zinc-200">
                  <span>Not today · {group.length}</span><span>{showNotToday ? "⌃" : "⌄"}</span>
                </button>
              ) : null}
              <div id={groupIndex === 1 ? "not-today-habits" : undefined} hidden={groupIndex === 1 && !showNotToday} className="space-y-3">
          {group.map((habit, index) => (
            <div key={habit.id} data-habit-id={habit.id}
              className={`rounded-2xl ${dragging === habit.id ? "opacity-50" : ""} ${target === habit.id && target !== dragging ? "ring-2 ring-indigo-400" : ""}`}>
              <HabitCard habit={habit} days={days} showMotivation={showMotivation}
                historyOpen={openHistoryId === habit.id}
                onToggleHistory={() => setOpenHistoryId((current) => current === habit.id ? null : habit.id)} dragHandle={
                <button type="button" disabled={isSaving || group.length < 2}
                  aria-label={`Move ${habit.name}, position ${index + 1} of ${group.length} in ${groupIndex === 0 ? "Today" : "Not today"}`}
                  aria-describedby="reorder-help"
                  className="flex h-11 w-9 shrink-0 touch-none select-none items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-30 cursor-grab active:cursor-grabbing"
                  onPointerDown={(event) => {
                    if (!event.isPrimary || event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(habit.id);
                    setTarget(habit.id);
                  }}
                  onPointerMove={(event) => {
                    if (dragging !== habit.id) return;
                    const scrollArea = event.currentTarget.closest(".app-scroll-area");
                    const bounds = scrollArea?.getBoundingClientRect();
                    if (scrollArea && bounds) {
                      if (event.clientY < bounds.top + 70) scrollArea.scrollBy(0, -16);
                      if (event.clientY > bounds.bottom - 70) scrollArea.scrollBy(0, 16);
                    }
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
                    moveHabit(habit.id, group[index + (event.key === "ArrowUp" ? -1 : 1)]?.id ?? null);
                  }}>
                  <svg aria-hidden="true" viewBox="0 0 16 24" className="h-5 w-4" fill="currentColor">
                    {[6, 12, 18].map((y) => <g key={y}><circle cx="5" cy={y} r="1.5" /><circle cx="11" cy={y} r="1.5" /></g>)}
                  </svg>
                </button>
              } />
            </div>
          ))}
              </div>
            </div>
          ))
        )}
      </section>

      <details className="rounded-2xl border border-dashed border-zinc-700 p-4">
        <summary className="cursor-pointer text-center text-sm font-medium text-zinc-300">New habit</summary>
        <div className="mt-4"><HabitForm mode="create" /></div>
      </details>
    </div>
  );
}
