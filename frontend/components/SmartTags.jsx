import { useMemo } from "react";
import { buildSmartTags } from "../utils/smartTags";

const TONE_CLASSES = {
  good: "bg-emerald-500/15 text-emerald-100",
  warn: "bg-amber-500/15 text-amber-100",
  alert: "bg-rose-500/15 text-rose-100"
};

export default function SmartTags({ repos = [], lastActive, totalRepos }) {
  const { tags, languageBreakdown } = useMemo(
    () => buildSmartTags(repos, { lastActive, totalRepos }),
    [repos, lastActive, totalRepos]
  );

  if (!tags.length && !languageBreakdown.length) {
    return (
      <div className="glass-card p-6 text-sm text-slate-500 dark:text-slate-300">
        No skill tags available yet.
      </div>
    );
  }

  return (
    <div className="glass-card card-hover p-6 fade-up">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Smart Tags</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Rule-based skill tags derived from repository signals.
          </p>
        </div>
        {languageBreakdown.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {languageBreakdown.slice(0, 3).map((lang) => (
              <span
                key={lang.name}
                className="rounded-full border border-slate-700/40 bg-slate-900/70 px-2 py-1 text-slate-200"
              >
                {lang.name} {lang.percent}%
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.label}
            title={tag.reason}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 ${
              TONE_CLASSES[tag.tone] || TONE_CLASSES.good
            }`}
          >
            <span>{tag.icon}</span>
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}
