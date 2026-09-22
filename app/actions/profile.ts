"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateProfile, type readProfile } from "@/lib/profile";

export async function updateProfile(input: ReturnType<typeof readProfile>) {
  const profile = validateProfile(input);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Please sign in to update your profile.");
  // Only send profile fields; Supabase merges metadata and preserves habit_order.
  const { error } = await supabase.auth.updateUser({ data: {
    display_name: profile.displayName,
    show_motivation: profile.showMotivation,
    expand_rest_days: profile.expandRestDays,
  } });
  if (error) throw new Error("Could not save your profile. Please try again.");
  revalidatePath("/", "layout");
}
