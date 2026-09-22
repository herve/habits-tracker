import { loadHabits } from "@/lib/load-habits";
import Dashboard from "@/components/Dashboard";
import AppShell from "@/components/AppShell";
import { HISTORY_DAYS } from "@/lib/constants";
import { getLastNDays } from "@/lib/dates";

export default async function Home() {
  const habits = await loadHabits();
  const days = getLastNDays(HISTORY_DAYS);

  return (
    <AppShell active="habits">
      <main>
        <Dashboard habits={habits} days={days} />
      </main>
    </AppShell>
  );
}
