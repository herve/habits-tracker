import 'server-only';
import { seedDefaultHabits } from '@/app/actions/habits';
import { computeStreak } from '@/lib/streaks';
import { createClient } from '@/lib/supabase/server';
import type { Completion, Habit, HabitWithCompletions } from '@/types/habit';
export async function loadHabits(shouldSeed = true): Promise<HabitWithCompletions[]> {
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

  // Supabase caps each response. Page through history so records remain accurate.
  const completions: Completion[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.from("completions").select("*")
      .order("id").range(offset, offset + 999);
    if (error) throw new Error(error.message);
    completions.push(...(data as Completion[]));
    if (data.length < 1000) break;
  }

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
      streak: computeStreak(completedDates, undefined, habit.schedule_days ?? null),
    };
  });
}
