export default function ProgressRing({ value, label }: { value: number | null; label: string }) {
  const progress = Math.min(100, Math.max(0, value ?? 0));
  return <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`${label}: ${value === null ? "no scheduled habits" : `${progress}%`}`}>
    <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" pathLength="100" strokeDasharray={`${progress} 100`} strokeLinecap={progress ? "round" : "butt"} className="text-indigo-400" />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-zinc-100">{value === null ? "—" : `${progress}%`}</span>
  </div>;
}
