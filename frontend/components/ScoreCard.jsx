export default function ScoreCard({ scoreData }) {
  return (
    <div className="glass-card p-6 fade-up">
      <h2 className="text-xl font-semibold">Developer Score</h2>
      <p className="mt-2 text-5xl font-bold text-emerald-700">{scoreData?.score ?? 0}/100</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-emerald-50 p-3">
          <p className="text-slate-500">Repos</p>
          <p className="font-semibold text-slate-900">{scoreData?.breakdown?.repos ?? 0}</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-slate-500">Stars</p>
          <p className="font-semibold text-slate-900">{scoreData?.breakdown?.stars ?? 0}</p>
        </div>
        <div className="rounded-lg bg-cyan-50 p-3">
          <p className="text-slate-500">Activity</p>
          <p className="font-semibold text-slate-900">{scoreData?.breakdown?.activity ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
