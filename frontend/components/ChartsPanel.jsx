import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#0b6e4f", "#ef8f00", "#1f7a8c", "#6a4c93", "#bc4749", "#588157"];

export default function ChartsPanel({ languages = {}, activity = [] }) {
  const languageData = Object.entries(languages).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card border border-emerald-500/10 bg-white/80 p-6 fade-up dark:border-emerald-500/20 dark:bg-slate-900/80">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Language Mix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Top languages by repo count.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={languageData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {languageData.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card border border-emerald-500/10 bg-white/80 p-6 fade-up dark:border-emerald-500/20 dark:bg-slate-900/80">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Activity Pulse</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Monthly repository updates.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0b6e4f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
