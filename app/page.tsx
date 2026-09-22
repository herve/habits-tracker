import { loadHabits } from "@/lib/load-habits";
import Dashboard from "@/components/Dashboard";
import Header from "@/components/Header";
import { HISTORY_DAYS } from "@/lib/constants";
import { getLastNDays } from "@/lib/dates";

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
