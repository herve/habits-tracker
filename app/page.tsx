import { seedDefaultHabits } from "@/app/actions/habits";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import { HISTORY_DAYS } from "@/lib/constants";
import { getLastNDays } from "@/lib/dates";
import { computeStreak } from "@/lib/streaks";
import { createClient } from "@/lib/supabase/server";
import type { Completion, Habit, HabitWithCompletions } from "@/types/habit";

async function loadHabits(shouldSeed = true): Promise<HabitWithCompletions[]> {
  const supabase = await createClient();

  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: true });

  if (habitsError) throw new Error(habitsError.message);

  const { data: { user } } = await supabase.auth.getUser();
  const savedOrder: unknown = user?.user_metadata?.habit_order;
  const order = new Map<string, number>(
    Array.isArray(savedOrder)
      ? savedOrder.filter((id): id is string => typeof id === "string").map((id, index) => [id, index])
      : [],
  );
  habits?.sort((a, b) =>
    (order.get(a.id) ?? Infinity) - (order.get(b.id) ?? Infinity),
  );

  if (!habits?.length && shouldSeed) {
    await seedDefaultHabits();
    return loadHabits(false);
  }

  const { data: completions, error: completionsError } = await supabase
    .from("completions")
    .select("*");

  if (completionsError) throw new Error(completionsError.message);

  return (habits as Habit[]).map((habit) => {
    const habitCompletions = (completions as Completion[] | null)?.filter(
      (completion) => completion.habit_id === habit.id,
    ) ?? [];

    const completedDates = new Set(
      habitCompletions.filter((c) => c.done).map((c) => c.date),
    );

    return {
      ...habit,
      completions: habitCompletions,
      streak: computeStreak(completedDates),
    };
  });
}

export default async function Home() {
  const habits = await loadHabits();
  const days = getLastNDays(HISTORY_DAYS);

  return (
    <>
      <Header />
      <main>
        <Dashboard habits={habits} days={days} />
      </main>
    </>
  );
}
