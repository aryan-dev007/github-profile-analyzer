function WinnerBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
      <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        aria-hidden="true"
        className="text-cyan-200"
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
  if (!isWinner) return "text-slate-200";

  return "rounded-xl bg-cyan-400/10 px-3 py-2 text-cyan-100";
}

export default function CompareTable({ metrics, userA, userB }) {
  return (
    <div className="glass-card glass-strong neon-border card-hover p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">Comparison Table</h2>
        <p className="text-sm text-slate-300">
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
          <tbody className="divide-y divide-white/10">
            {metrics.map((metric) => {
              const isWinnerA = metric.winner === "A";
              const isWinnerB = metric.winner === "B";
              return (
                <tr key={metric.key} className="text-slate-200">
                  <td className="py-3 pr-4 font-medium text-white">
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
