const ICONS = {
  "Total Repos": "📦",
  "Total Stars": "⭐",
  "Total Forks": "🍴",
  Languages: "🧬",
  "Last Active": "🕒"
};

export default function StatCard({ label, value, delay = 0 }) {
  const icon = ICONS[label] || "✨";

  return (
    <div
      className="glass-card card-hover border border-emerald-500/15 bg-white/80 p-4 fade-up dark:border-emerald-500/25 dark:bg-slate-900/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
          Live
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  );
}
