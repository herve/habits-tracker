import Link from "next/link";

export default function BottomNavigation({ active }: { active: "habits" | "stats" }) {
  return (
    <nav aria-label="Main navigation" className="bottom-navigation border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex w-full max-w-xl justify-center gap-1 px-4 py-3 text-sm">
        <Link href="/" aria-current={active === "habits" ? "page" : undefined} className={`rounded-lg px-3 py-2 ${active === "habits" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}>Habits</Link>
        <Link href="/stats" aria-current={active === "stats" ? "page" : undefined} className={`rounded-lg px-3 py-2 ${active === "stats" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}>Stats</Link>
      </div>
    </nav>
  );
}
