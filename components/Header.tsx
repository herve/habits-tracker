import { signOut } from "@/app/actions/habits";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-50">Habits</h1>
        <p className="text-sm text-zinc-500">Track your daily progress</p>
      </div>
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
