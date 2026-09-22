import { loadHabits } from "@/lib/load-habits";
import Dashboard from "@/components/Dashboard";
import AppShell from "@/components/AppShell";
import { HISTORY_DAYS } from "@/lib/constants";
import { getLastNDays } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import { readProfile } from "@/lib/profile";

export default async function Home() {
  const habits = await loadHabits();
  const days = getLastNDays(HISTORY_DAYS);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const preferences = readProfile(user?.user_metadata ?? {});

  return (
    <AppShell active="habits">
      <main>
        <Dashboard key={String(preferences.expandRestDays)} habits={habits} days={days} showMotivation={preferences.showMotivation} expandRestDays={preferences.expandRestDays} />
      </main>
    </AppShell>
  );
}
