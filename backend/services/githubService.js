const axios = require("axios");
const { GITHUB_TOKEN, GITHUB_COOLDOWN_MS } = require("../config/env");
const AppError = require("../utils/appError");

const GITHUB_STATS_CACHE_TTL_MS = 5 * 60 * 1000;
const githubStatsCache = new Map();
const githubStatsInflight = new Map();
const githubStatsLastRequest = new Map();

function createGithubClient(token = "") {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    timeout: 12000
  });
}


async function fetchAllRepos(username, githubClient) {
  const repos = [];
  let page = 1;

  while (true) {
    const response = await githubClient.get(`/users/${username}/repos`, {
      params: {
        per_page: 100,
        page,
        sort: "updated"
      }
    });

    repos.push(...response.data);

    if (response.data.length < 100) break;
    page += 1;
  }

  return repos;
}

function isTokenAuthFailure(error) {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || "").toLowerCase();

  if (status === 401) return true;
  if (status !== 403) return false;

  return (
    message.includes("bad credentials") ||
    message.includes("resource not accessible") ||
    message.includes("forbidden")
  );
}

function isRateLimitError(error) {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || "").toLowerCase();
  const rateLimitRemaining = error?.response?.headers?.["x-ratelimit-remaining"];

  return (
    status === 429 ||
    (status === 403 && rateLimitRemaining === "0") ||
    message.includes("rate limit")
  );
}

function mapGithubError(error) {
  if (error.response?.status === 404) {
    throw new AppError("Invalid GitHub username", 404);
  }

  if (isRateLimitError(error)) {
    throw new AppError("GitHub API rate limit exceeded", 429);
  }

  throw new AppError("Failed to fetch GitHub profile data", 500);
}


async function fetchGithubStatsWithClient(username, githubClient) {
  const [userResponse, repos] = await Promise.all([
    githubClient.get(`/users/${username}`),
    fetchAllRepos(username, githubClient)
  ]);

  const user = userResponse.data;
  const totalStars = repos.reduce(
    (sum, repo) => sum + (repo.stargazers_count || 0),
    0
  );
  const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);

  const lastActive = repos.length
    ? repos
        .map((repo) => repo.pushed_at)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0]
    : user.updated_at;

  const topRepos = [...repos]
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language,
      url: repo.html_url,
      updatedAt: repo.updated_at
    }));

  const reposSummary = repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stargazers_count || 0,
    language: repo.language,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    url: repo.html_url,
    updatedAt: repo.updated_at,
    size: repo.size || 0
  }));

  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    avatar_url: user.avatar_url,
    profileUrl: user.html_url,
    name: user.name,
    bio: user.bio,
    followers: user.followers,
    following: user.following,
    created_at: user.created_at,
    totalRepos: user.public_repos,
    location: user.location,
    company: user.company,
    blog: user.blog,
    totalStars,
    totalForks,
    languages: buildLanguageCountMap(repos),
    lastActive,
    topRepos,
    activityByMonth: buildActivitySeries(repos),
    repoGrowth: buildRepoGrowthSeries(repos),
    reposSummary
  };
}

function getCacheKey(username) {
  return String(username || "").trim().toLowerCase();
}

function getCachedStats(cacheKey) {
  const cached = githubStatsCache.get(cacheKey);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    githubStatsCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function setCachedStats(cacheKey, data) {
  githubStatsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + GITHUB_STATS_CACHE_TTL_MS
  });
}


function enforceCooldown(cacheKey) {
  const now = Date.now();
  const lastRequestAt = githubStatsLastRequest.get(cacheKey);
  if (!lastRequestAt) return;

  const elapsed = now - lastRequestAt;
  if (elapsed >= GITHUB_COOLDOWN_MS) return;

  const waitSeconds = Math.ceil((GITHUB_COOLDOWN_MS - elapsed) / 1000);
  throw new AppError(
    `GitHub API cooldown active. Try again in ${waitSeconds}s.`,
    429
  );
}

function buildLanguageCountMap(repos) {
  return repos.reduce((acc, repo) => {
    if (!repo.language) return acc;
    const language = repo.language;
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});
}

function buildActivitySeries(repos) {
  const grouped = repos.reduce((acc, repo) => {
    if (!repo.pushed_at) return acc;
    const monthKey = repo.pushed_at.slice(0, 7);
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function buildRepoGrowthSeries(repos) {
  const grouped = repos.reduce((acc, repo) => {
    if (!repo.created_at) return acc;
    const monthKey = repo.created_at.slice(0, 7);
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {});

  const sorted = Object.entries(grouped)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  let cumulative = 0;
  return sorted.map((entry) => {
    cumulative += entry.count;
    return {
      month: entry.month,
      count: cumulative
    };
  });
}

async function getGithubStats(username) {
  const cacheKey = getCacheKey(username);

  const cachedStats = getCachedStats(cacheKey);
  if (cachedStats) {
    return cachedStats;
  }

  if (githubStatsInflight.has(cacheKey)) {
    return githubStatsInflight.get(cacheKey);
  }

  enforceCooldown(cacheKey);
  githubStatsLastRequest.set(cacheKey, Date.now());

  const authenticatedClient = createGithubClient(GITHUB_TOKEN);
  const anonymousClient = createGithubClient();

  const fetchPromise = (async () => {
    try {
      let stats = null;

      if (GITHUB_TOKEN) {
        stats = await fetchGithubStatsWithClient(username, authenticatedClient);
      } else {
        stats = await fetchGithubStatsWithClient(username, anonymousClient);
      }

      setCachedStats(cacheKey, stats);
      return stats;
    } catch (error) {
      if (GITHUB_TOKEN && isTokenAuthFailure(error)) {
        try {
          const stats = await fetchGithubStatsWithClient(username, anonymousClient);
          setCachedStats(cacheKey, stats);
          return stats;
        } catch (retryError) {
          mapGithubError(retryError);
        }
      }

      mapGithubError(error);
    } finally {
      githubStatsInflight.delete(cacheKey);
    }
  })();

  githubStatsInflight.set(cacheKey, fetchPromise);
  return fetchPromise;
}

module.exports = {
  getGithubStats
};
