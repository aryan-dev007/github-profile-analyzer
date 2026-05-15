export default function ScoreCard({ scoreData }) {
  const score = scoreData?.score ?? 0;
  const percent = Math.min(100, Math.max(0, score));

  return (
    <div className="glass-card card-hover relative overflow-hidden border border-emerald-500/15 bg-white/80 p-6 fade-up backdrop-blur dark:border-emerald-500/25 dark:bg-slate-900/80">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Developer Score
        </h2>
        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
          Signal
        </span>
      </div>
      <p className="relative mt-3 text-5xl font-bold text-emerald-400">
        {score}
        <span className="text-lg text-slate-400">/100</span>
      </p>

      <div className="relative mt-5 h-2 w-full rounded-full bg-emerald-100/80 dark:bg-emerald-500/20">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-3">
          <p className="text-xs uppercase tracking-widest text-emerald-200">Repos</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.repos ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-xs uppercase tracking-widest text-amber-200">Stars</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.stars ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
          <p className="text-xs uppercase tracking-widest text-cyan-200">Activity</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.activity ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
