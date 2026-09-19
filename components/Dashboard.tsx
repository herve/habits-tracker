import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import type { HabitWithCompletions } from "@/types/habit";

type DashboardProps = {
  habits: HabitWithCompletions[];
  days: string[];
};

export default function Dashboard({ habits, days }: DashboardProps) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-6">
      <section className="space-y-3">
        {habits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-sm text-zinc-500">
            No habits yet. Add your first one below.
          </p>
        ) : (
          habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} days={days} />
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
