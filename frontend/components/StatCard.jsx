export default function StatCard({ label, value, delay = 0 }) {
  return (
    <div
      className="glass-card border border-emerald-500/10 bg-white/80 p-4 fade-up transition hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-500/20 dark:bg-slate-900/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="h-1 w-10 rounded-full bg-emerald-500/70" />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  );
}
