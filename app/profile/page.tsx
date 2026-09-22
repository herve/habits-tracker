import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import ProfileForm from "@/components/ProfileForm";
import ProgressRing from "@/components/ProgressRing";
import { signOut } from "@/app/actions/habits";
import { createClient } from "@/lib/supabase/server";
import { readProfile } from "@/lib/profile";
import { loadHabits } from "@/lib/load-habits";
import { computeStats } from "@/lib/stats";
import { today } from "@/lib/dates";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const stats = computeStats(await loadHabits(false), today());
  const profile = readProfile(user.user_metadata);
  const joined = new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return <AppShell active="profile"><main className="mx-auto w-full max-w-xl space-y-6 px-4 py-8">
    <h2 className="text-xl font-semibold text-zinc-100">Profile</h2>
    <ProfileForm initial={profile} email={user.email ?? ""} joined={joined} />
    <section aria-label="Your activity" className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-300">Your activity</h2>
      <dl className="grid grid-cols-2 gap-3">{[
        ["Habits", stats.totalHabits], ["Completed check-ins", stats.totalCompleted],
        ["Best ongoing streak", `${stats.currentStreak} days`], ["Longest streak", `${stats.longestStreak} days`],
      ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/5 bg-zinc-900/50 p-4"><dt className="text-xs text-zinc-400">{label}</dt><dd className="mt-1 text-xl font-medium text-zinc-100">{value}</dd></div>)}</dl>
      <div className="flex items-center gap-4 rounded-xl bg-indigo-400/10 p-4"><ProgressRing value={stats.percentage} label="This week's completion" /><div><h3 className="text-sm font-medium text-indigo-200">This week</h3><p className="text-sm text-zinc-400">{stats.completed} of {stats.scheduled} scheduled check-ins</p><p className="text-xs text-zinc-500">Monday through today</p></div></div>
    </section>
    <form action={signOut}><button type="submit" className="min-h-11 w-full rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Sign out</button></form>
  </main></AppShell>;
}
