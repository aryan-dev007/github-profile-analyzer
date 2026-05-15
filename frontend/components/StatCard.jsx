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
      className="glass-card glass-strong neon-border card-hover p-4 fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className="status-pill bg-cyan-400/15 text-cyan-200">
          Live
        </span>
      </div>
      <p className="mt-4 text-sm text-slate-300">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </div>
  );
}
