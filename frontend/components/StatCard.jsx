export default function StatCard({ label, value, delay = 0 }) {
  return (
    <div className="glass-card p-4 fade-up" style={{ animationDelay: `${delay}ms` }}>
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}
