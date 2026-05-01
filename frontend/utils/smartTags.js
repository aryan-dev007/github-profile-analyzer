const FRONTEND_LANGUAGES = new Set(["JavaScript", "TypeScript", "HTML", "CSS"]);
const BACKEND_LANGUAGES = new Set([
  "Java",
  "Python",
  "Go",
  "C#",
  "Ruby",
  "PHP",
  "TypeScript",
  "JavaScript"
]);
const BACKEND_FRAMEWORKS = [
  "express",
  "nestjs",
  "spring",
  "django",
  "flask",
  "fastapi",
  "rails",
  "laravel"
];

function toLower(value) {
  return String(value || "").toLowerCase();
}

function isRecentActivity(value, days = 90) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

function calculatePercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export function buildSmartTags(repos = [], { lastActive, totalRepos } = {}) {
  if (!Array.isArray(repos) || repos.length === 0) {
    return { tags: [], languageBreakdown: [] };
  }

  const languageCounts = new Map();
  let totalLanguageCount = 0;
  let frontendCount = 0;
  let jsCount = 0;
  let backendLanguageHit = false;
  let backendFrameworkHit = false;

  repos.forEach((repo) => {
    const language = repo?.language;
    if (language) {
      totalLanguageCount += 1;
      languageCounts.set(language, (languageCounts.get(language) || 0) + 1);

      if (FRONTEND_LANGUAGES.has(language)) {
        frontendCount += 1;
      }
      if (language === "JavaScript") {
        jsCount += 1;
      }
      if (BACKEND_LANGUAGES.has(language)) {
        backendLanguageHit = true;
      }
    }

    const topics = Array.isArray(repo?.topics) ? repo.topics : [];
    const haystack = toLower(`${repo?.description || ""} ${topics.join(" ")}`);
    if (BACKEND_FRAMEWORKS.some((framework) => haystack.includes(framework))) {
      backendFrameworkHit = true;
    }
  });

  const languageBreakdown = [...languageCounts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percent: calculatePercent(count, totalLanguageCount)
    }))
    .sort((a, b) => b.count - a.count);

  const tags = [];
  const repoCount = typeof totalRepos === "number" ? totalRepos : repos.length;
  const frontendShare = totalLanguageCount
    ? frontendCount / totalLanguageCount
    : 0;
  const jsShare = totalLanguageCount ? jsCount / totalLanguageCount : 0;

  if (repoCount < 5) {
    tags.push({
      label: "Beginner Developer",
      tone: "warn",
      icon: "🌱",
      reason: "Fewer than 5 repositories detected."
    });
  }

  const isFrontend = frontendShare > 0.5;
  if (isFrontend) {
    tags.push({
      label: "Frontend Developer",
      tone: "good",
      icon: "🎨",
      reason: `Frontend languages make up ${calculatePercent(
        frontendCount,
        totalLanguageCount
      )}% of activity.`
    });
  }

  const isBackend = backendLanguageHit && backendFrameworkHit;
  if (isBackend) {
    tags.push({
      label: "Backend Developer",
      tone: "good",
      icon: "🧩",
      reason: "Backend languages + frameworks detected in repos."
    });
  }

  if (isFrontend && isBackend) {
    tags.push({
      label: "Full Stack Developer",
      tone: "good",
      icon: "🛠️",
      reason: "Both frontend and backend signals are present."
    });
  }

  if (jsShare > 0.6) {
    tags.push({
      label: "JavaScript Focused",
      tone: "good",
      icon: "✨",
      reason: `JavaScript accounts for ${calculatePercent(
        jsCount,
        totalLanguageCount
      )}% of repos.`
    });
  }

  if (repoCount > 15 && isRecentActivity(lastActive, 90)) {
    tags.push({
      label: "Active Developer",
      tone: "good",
      icon: "⚡",
      reason: "15+ repos and recent activity in the last 90 days."
    });
  }

  if (languageCounts.size === 1 && totalLanguageCount > 0) {
    tags.push({
      label: "Limited Tech Stack",
      tone: "alert",
      icon: "⚠️",
      reason: "Only one language detected across repositories."
    });
  }

  return { tags, languageBreakdown };
}
