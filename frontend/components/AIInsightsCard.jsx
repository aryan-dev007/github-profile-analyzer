import { parseInsights } from "../utils/parseInsights";

function Section({ title, points, tone }) {
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <h3 className="font-semibold">{title}</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        {(points?.length ? points : ["No data", "No data", "No data"]).map((item, idx) => (
          <li key={`${title}-${idx}`}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

export default function AIInsightsCard({ insightsText }) {
  const sections = parseInsights(insightsText);

  return (
    <div className="glass-card p-6 fade-up">
      <h2 className="text-xl font-semibold">AI Insights</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Section title="Strengths" points={sections.strengths} tone="bg-emerald-50" />
        <Section title="Weaknesses" points={sections.weaknesses} tone="bg-rose-50" />
        <Section title="Improvements" points={sections.improvements} tone="bg-amber-50" />
      </div>
    </div>
  );
}
