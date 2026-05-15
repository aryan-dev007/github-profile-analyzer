export default function ScoreCard({ scoreData }) {
  const score = scoreData?.score ?? 0;
  const percent = Math.min(100, Math.max(0, score));

  return (
    <div className="glass-card glass-strong neon-border card-hover relative overflow-hidden p-6 fade-up">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Developer Score
        </h2>
        <span className="status-pill bg-cyan-400/15 text-cyan-200">
          Signal
        </span>
      </div>
      <p className="relative mt-3 text-5xl font-bold text-cyan-300">
        {score}
        <span className="text-lg text-slate-400">/100</span>
      </p>

      <div className="relative mt-5 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-pink-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
          <p className="text-xs uppercase tracking-widest text-cyan-200">Repos</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.repos ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-3">
          <p className="text-xs uppercase tracking-widest text-pink-200">Stars</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.stars ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3">
          <p className="text-xs uppercase tracking-widest text-emerald-200">Activity</p>
          <p className="text-lg font-semibold text-white">
            {scoreData?.breakdown?.activity ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
