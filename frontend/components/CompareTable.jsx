function WinnerBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
      <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        aria-hidden="true"
        className="text-emerald-600"
      >
        <path
          fill="currentColor"
          d="M3 7l4 4 5-6 5 6 4-4v10H3V7zm4 8h10v-3l-5-4-5 4v3z"
        />
      </svg>
      Winner
    </span>
  );
}

function getCellClass(isWinner) {
  if (!isWinner) return "text-slate-900 dark:text-white";

  return "rounded-xl bg-emerald-50/70 px-3 py-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200";
}

export default function CompareTable({ metrics, userA, userB }) {
  return (
    <div className="glass-card border border-emerald-500/10 bg-white/80 p-6 dark:border-emerald-500/20 dark:bg-slate-900/80">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Comparison Table</h2>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Metric-by-metric performance across both profiles.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-400">
              <th className="pb-3">Metric</th>
              <th className="pb-3">{userA}</th>
              <th className="pb-3">{userB}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
            {metrics.map((metric) => {
              const isWinnerA = metric.winner === "A";
              const isWinnerB = metric.winner === "B";
              return (
                <tr key={metric.key} className="text-slate-700 dark:text-slate-200">
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {metric.label}
                  </td>
                  <td className="py-3">
                    <div className={getCellClass(isWinnerA)}>
                      <span>{metric.displayA}</span>
                      {isWinnerA && <WinnerBadge />}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className={getCellClass(isWinnerB)}>
                      <span>{metric.displayB}</span>
                      {isWinnerB && <WinnerBadge />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
