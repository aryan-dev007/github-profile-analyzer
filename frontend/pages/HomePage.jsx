import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

const GITHUB_USERNAME_REGEX = /^(?!-)(?!.*--)[a-zA-Z0-9-]{1,39}(?<!-)$/;

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmed = username.trim();

    if (!trimmed) {
      setError("Please enter a GitHub username");
      return;
    }

    if (!GITHUB_USERNAME_REGEX.test(trimmed)) {
      setError("Enter a valid GitHub username");
      return;
    }

    setError("");
    navigate(`/dashboard/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="relative min-h-screen">
      <div className="app-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-300 to-amber-300 shadow-lg shadow-emerald-500/30" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">PulseBoard</p>
              <p className="glow-title text-lg font-semibold">Developer Analytics</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/compare"
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100"
            >
              Compare
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <section className="genz-hero mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
        <div className="hero-grid" />
        <div className="relative z-10 grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="floating-pill inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900/70 dark:text-emerald-200">
              Live GitHub Signal Lab
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            <h1 className="stagger-item text-4xl font-bold leading-tight text-slate-900 md:text-6xl dark:text-white">
              Turn developer footprints into a
              <span className="glow-title"> story of impact</span>.
            </h1>

            <p className="stagger-item max-w-xl text-base text-slate-600 md:text-lg dark:text-slate-300">
              Drop a GitHub username and get a clean, Gen-Z flavored dashboard: stats,
              AI insights, growth trends, and a shareable report.
            </p>

            <form
              className="stagger-item flex flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
              noValidate
            >
              <input
                type="text"
                name="githubUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. torvalds"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 text-base text-slate-900 outline-none ring-emerald-300 transition focus:ring dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
              />

              <button
                type="submit"
                className="glow-button rounded-2xl px-6 py-4 text-base font-semibold text-white"
              >
                Analyze Profile
              </button>
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="stagger-item flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-300">
              <span className="soft-bounce rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
                No login required
              </span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
                AI insights + growth tracker
              </span>
              <span className="soft-bounce rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
                Exportable PDF report
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="glass-card glass-card-dark relative flex min-h-[320px] flex-col justify-between overflow-hidden p-6 text-white">
              <div className="orbit-ring" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  Snapshot
                </p>
                <h2 className="mt-3 text-2xl font-semibold">Your impact in a glance</h2>
                <p className="mt-2 text-sm text-slate-200">
                  AI + stats blended into quick, shareable cards.
                </p>
              </div>
              <div className="relative z-10 grid gap-3 sm:grid-cols-2">
                <div className="sticker rounded-2xl p-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Momentum
                  </p>
                  <p className="mt-2 text-2xl font-bold">+38%</p>
                  <p className="text-xs text-slate-700">Growth last 90 days</p>
                </div>
                <div className="sticker rounded-2xl p-4 text-slate-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                    Stack
                  </p>
                  <p className="mt-2 text-2xl font-bold">JS / TS</p>
                  <p className="text-xs text-slate-700">Top languages</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-white/80 p-4 text-xs text-slate-600 shadow-lg backdrop-blur md:block dark:bg-slate-900/80 dark:text-slate-200">
              <p className="font-semibold">New: Skill tags + highlights</p>
              <p className="mt-1">Auto-detect your dev profile.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}