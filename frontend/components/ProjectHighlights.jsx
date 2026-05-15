const DESCRIPTION_MAX_LENGTH = 140;

function truncate(text = "", maxLength = DESCRIPTION_MAX_LENGTH) {
  if (!text) return "No description provided.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function getBestRepo(repos) {
  return repos.reduce(
    (best, repo) => (repo.stars > (best?.stars || 0) ? repo : best),
    null
  );
}

function getMostComplexRepo(repos) {
  return repos.reduce(
    (best, repo) => (repo.size > (best?.size || 0) ? repo : best),
    null
  );
}

function getMostRecentRepo(repos) {
  return [...repos]
    .filter((repo) => repo.updatedAt)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
}

function formatTimeAgo(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function Card({ title, icon, repo, meta, descriptionFallback }) {
  if (!repo) return null;

  const description = truncate(repo.description || descriptionFallback || "");
  const language = repo.language || "Unknown";

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="group card-hover relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-white/80 p-5 text-slate-900 shadow-sm dark:border-emerald-500/25 dark:bg-slate-900/80 dark:text-slate-100"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/20" />
      </div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            {icon} {title}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {repo.name}
          </h3>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
          {language}
        </span>
      </div>

      <p className="relative mt-3 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <div className="relative mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-200">
        {meta}
      </div>
    </a>
  );
}

export default function ProjectHighlights({ repos = [] }) {
  if (!Array.isArray(repos) || repos.length === 0) {
    return (
      <div className="glass-card p-6 text-sm text-slate-500">
        No repositories available for highlights.
      </div>
    );
  }

  const bestRepo = getBestRepo(repos);
  const recentRepo = getMostRecentRepo(repos);
  const complexRepo = getMostComplexRepo(repos);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Project Highlights</h2>
        <div className="text-xs text-slate-500 dark:text-slate-300">
          Top picks by stars, recency, and size.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Best Repository"
          icon="⭐"
          repo={bestRepo}
          meta={`Stars: ${bestRepo?.stars || 0}`}
          descriptionFallback="Most starred project from this profile."
        />
        <Card
          title="Recently Updated"
          icon="🕒"
          repo={recentRepo}
          meta={`Updated ${formatTimeAgo(recentRepo?.updatedAt)}`}
          descriptionFallback="Latest repository update from this profile."
        />
        <Card
          title="Most Complex"
          icon="🧠"
          repo={complexRepo}
          meta={`Size: ${complexRepo?.size || 0} KB`}
          descriptionFallback="Largest repository by size."
        />
      </div>
    </div>
  );
}
