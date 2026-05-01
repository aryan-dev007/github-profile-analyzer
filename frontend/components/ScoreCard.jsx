export default function ScoreCard({ scoreData }) {
  const score = scoreData?.score ?? 0;
  const percent = Math.min(100, Math.max(0, score));

  return (
    <div className="glass-card relative overflow-hidden border border-emerald-500/10 bg-white/80 p-6 fade-up backdrop-blur dark:border-emerald-500/20 dark:bg-slate-900/80">
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl" />
      <h2 className="relative text-xl font-semibold text-slate-900 dark:text-white">
        Developer Score
      </h2>
      <p className="relative mt-2 text-5xl font-bold text-emerald-700 dark:text-emerald-300">
        {score}/100
      </p>

      <div className="relative mt-4 h-2 w-full rounded-full bg-emerald-100/80 dark:bg-emerald-500/20">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
          <p className="text-slate-500 dark:text-slate-300">Repos</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {scoreData?.breakdown?.repos ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
          <p className="text-slate-500 dark:text-slate-300">Stars</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {scoreData?.breakdown?.stars ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-cyan-50 p-3 dark:bg-cyan-500/10">
          <p className="text-slate-500 dark:text-slate-300">Activity</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {scoreData?.breakdown?.activity ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
