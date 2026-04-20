const asyncHandler = require("../utils/asyncHandler");
const { getGithubStats } = require("../services/githubService");
const { calculateDeveloperScore } = require("../utils/scoreCalculator");

exports.getDeveloperScore = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const stats = await getGithubStats(username);
  const score = calculateDeveloperScore(stats);

  res.status(200).json({
    success: true,
    data: score
  });
});
