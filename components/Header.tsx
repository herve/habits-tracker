import { signOut } from "@/app/actions/habits";
import Link from "next/link";

export default function Header({ active = "habits" }: { active?: "habits" | "stats" }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-50">Habits</h1>
        <p className="text-sm text-zinc-500">Track your daily progress</p>
      </div>
      <nav aria-label="Main navigation" className="flex gap-1 text-sm">
        <Link href="/" aria-current={active === "habits" ? "page" : undefined} className={`rounded-lg px-3 py-2 ${active === "habits" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}>Habits</Link>
        <Link href="/stats" aria-current={active === "stats" ? "page" : undefined} className={`rounded-lg px-3 py-2 ${active === "stats" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}>Stats</Link>
      </nav>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
