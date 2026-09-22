"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_HABITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { isScheduledOn, normalizeSchedule } from "@/lib/schedule";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function seedDefaultHabits() {
  const { supabase, userId } = await getUserId();

  const { count, error: countError } = await supabase
    .from("habits")
    .select("*", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);
  if (count && count > 0) return;

  const { error } = await supabase.from("habits").insert(
    DEFAULT_HABITS.map((habit) => ({
      user_id: userId,
      name: habit.name,
      color: habit.color,
    })),
  );

  if (error) throw new Error(error.message);
  // Initialization runs during page rendering; cache invalidation is not allowed here.
}

export async function createHabit(name: string, color: string, scheduleDays: number[] | null = null) {
  const schedule = normalizeSchedule(scheduleDays);
  const { supabase, userId } = await getUserId();

  const { error } = await supabase.from("habits").insert({
    user_id: userId,
    name: name.trim(),
    color,
    schedule_days: schedule,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/stats");
}

export async function updateHabit(id: string, name: string, color: string, scheduleDays: number[] | null = null) {
  const schedule = normalizeSchedule(scheduleDays);
  const { supabase } = await getUserId();

  const { error } = await supabase
    .from("habits")
    .update({ name: name.trim(), color, schedule_days: schedule })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/stats");
}

export async function deleteHabit(id: string) {
  const { supabase } = await getUserId();

  const { error } = await supabase.from("habits").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/stats");
}

export async function toggleCompletion(
  habitId: string,
  date: string,
  done: boolean,
) {
  const { supabase, userId } = await getUserId();

  if (done) {
    const { data: habit, error: habitError } = await supabase
      .from("habits").select("*").eq("id", habitId).eq("user_id", userId).single();
    if (habitError || !habit) throw new Error("Habit not found");
    if (!isScheduledOn(habit.schedule_days, date)) {
      throw new Error("This habit is not scheduled for this day.");
    }
    const { error } = await supabase.from("completions").upsert(
      {
        habit_id: habitId,
        user_id: userId,
        date,
        done: true,
      },
      { onConflict: "habit_id,date" },
    );

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", date);

    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/stats");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function reorderHabits(ids: string[]) {
  const { supabase, userId } = await getUserId();
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string") ||
      new Set(ids).size !== ids.length) {
    throw new Error("Invalid habit order");
  }
  const { data: habits, error: readError } = await supabase
    .from("habits").select("id").eq("user_id", userId);
  if (readError) throw new Error(readError.message);
  const ownedIds = new Set(habits.map((habit) => habit.id));
  if (ids.length !== ownedIds.size || ids.some((id) => !ownedIds.has(id))) {
    throw new Error("Habits changed. Refresh and try again.");
  }
  const { error } = await supabase.auth.updateUser({ data: { habit_order: ids } });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/stats");
}
