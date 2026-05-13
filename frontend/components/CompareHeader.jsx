import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function WinnerBadge({ label }) {
  if (!label) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        aria-hidden="true"
        className="text-emerald-600"
      >
        <path
          fill="currentColor"
          d="M3 7l4 4 5-6 5 6 4-4v10H3V7zm4 8h10v-3l-5-4-5 4v3z"
        />
      </svg>
      {label}
    </span>
  );
}

export default function CompareHeader({ userA, userB, overallWinner }) {
  const nameA = userA || "User 1";
  const nameB = userB || "User 2";
  const winnerLabel = overallWinner ? `Overall Better Profile: ${overallWinner}` : "";

  return (
    <header className="mb-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-sm text-emerald-800 underline">
            Back
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Compare Profiles
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            Side-by-side analytics across impact, activity, and presence.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="glass-card border border-emerald-500/10 bg-white/80 p-4 dark:border-emerald-500/20 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Comparing <span className="font-semibold text-slate-900 dark:text-white">{nameA}</span> vs
            <span className="font-semibold text-slate-900 dark:text-white"> {nameB}</span>
          </div>
          <WinnerBadge label={winnerLabel} />
        </div>
      </div>
    </header>
  );
}
