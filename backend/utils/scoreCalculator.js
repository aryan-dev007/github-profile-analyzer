function getActivityScore(lastActive) {
  const lastActiveDate = new Date(lastActive);
  if (Number.isNaN(lastActiveDate.getTime())) return 0;

  const now = new Date();
  const daysSinceActive = Math.floor(
    (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceActive <= 30) return 30;
  if (daysSinceActive <= 90) return 20;
  if (daysSinceActive <= 180) return 12;
  return 5;
}

function calculateDeveloperScore({ totalRepos, totalStars, lastActive }) {
  const reposPoints = Math.min(totalRepos, 30);
  const starsPoints = Math.min(totalStars, 40);
  const activityPoints = getActivityScore(lastActive);

  const score = Math.min(100, reposPoints + starsPoints + activityPoints);

  return {
    score,
    breakdown: {
      repos: reposPoints,
      stars: starsPoints,
      activity: activityPoints
    }
  };
}

module.exports = {
  calculateDeveloperScore
};
