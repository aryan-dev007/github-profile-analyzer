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

const COLORS = ["#30f2ff", "#6dff9e", "#ff5cdf", "#22d3ee", "#fbbf24", "#f97316"];
const TOOLTIP_CONTENT_STYLE = {
  background: "rgba(8, 12, 20, 0.9)",
  border: "1px solid rgba(48, 242, 255, 0.45)",
  borderRadius: "14px",
  color: "#e2e8f0",
  boxShadow: "0 18px 40px rgba(3, 7, 18, 0.6)",
  backdropFilter: "blur(12px)"
};
const TOOLTIP_LABEL_STYLE = {
  color: "#7dd3fc",
  fontWeight: 600
};
const TOOLTIP_ITEM_STYLE = {
  color: "#e2e8f0",
  fontWeight: 500
};
const TOOLTIP_CURSOR_STYLE = {
  stroke: "rgba(48, 242, 255, 0.35)",
  strokeWidth: 1,
  fill: "rgba(48, 242, 255, 0.08)"
};

export default function ChartsPanel({ languages = {}, activity = [] }) {
  const languageData = Object.entries(languages).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="glass-card glass-strong neon-border card-hover p-6 fade-up">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Language Mix</h2>
          <p className="text-sm text-slate-300">Top languages by repo count.</p>
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
                label={{ fill: "#e2e8f0", fontSize: 11 }}
              >
                {languageData.map((entry, idx) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card glass-strong neon-border card-hover p-6 fade-up">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Activity Pulse</h2>
          <p className="text-sm text-slate-300">Monthly repository updates.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={TOOLTIP_CONTENT_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                cursor={TOOLTIP_CURSOR_STYLE}
              />
              <Bar dataKey="count" fill="#30f2ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
