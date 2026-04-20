const axios = require("axios");
const { GITHUB_TOKEN } = require("../config/env");
const AppError = require("../utils/appError");

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

  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    totalRepos: user.public_repos,
    totalStars,
    totalForks,
    languages: buildLanguageCountMap(repos),
    lastActive,
    topRepos,
    activityByMonth: buildActivitySeries(repos)
  };
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

async function getGithubStats(username) {
  const authenticatedClient = createGithubClient(GITHUB_TOKEN);
  const anonymousClient = createGithubClient();

  try {
    if (GITHUB_TOKEN) {
      return await fetchGithubStatsWithClient(username, authenticatedClient);
    }

    return await fetchGithubStatsWithClient(username, anonymousClient);
  } catch (error) {
    if (GITHUB_TOKEN && isTokenAuthFailure(error)) {
      try {
        return await fetchGithubStatsWithClient(username, anonymousClient);
      } catch (retryError) {
        mapGithubError(retryError);
      }
    }

    mapGithubError(error);
  }
}

module.exports = {
  getGithubStats
};
