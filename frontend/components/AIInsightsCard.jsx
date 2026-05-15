import { parseInsights } from "../utils/parseInsights";

function Section({ title, points, tone }) {
  return (
    <div className={`rounded-2xl border border-slate-800/40 p-4 ${tone}`}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
        {title}
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        {(points?.length ? points : ["No data", "No data", "No data"]).map((item, idx) => (
          <div
            key={`${title}-${idx}`}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIInsightsCard({ insightsText, errorMessage, isHeuristic = false }) {
  const sections = parseInsights(insightsText);
  const hasInsights =
    sections.strengths.length ||
    sections.weaknesses.length ||
    sections.improvements.length;

  return (
    <div className="glass-card card-hover p-6 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">AI Insights</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Narrative strengths, gaps, and next steps.
          </p>
        </div>
        {isHeuristic ? (
          <span className="rounded-full bg-slate-800/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
            Heuristic Mode
          </span>
        ) : null}
      </div>
      {errorMessage && !hasInsights ? (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : !hasInsights ? (
        <p className="mt-3 rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          No AI insights available. Please ensure the backend is running or try again.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Section
            title="Strengths"
            points={sections.strengths}
            tone="bg-emerald-500/10"
          />
          <Section
            title="Weaknesses"
            points={sections.weaknesses}
            tone="bg-rose-500/10"
          />
          <Section
            title="Improvements"
            points={sections.improvements}
            tone="bg-amber-500/10"
          />
        </div>
      )}
    </div>
  );
}
