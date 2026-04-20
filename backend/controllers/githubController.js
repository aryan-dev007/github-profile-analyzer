const asyncHandler = require("../utils/asyncHandler");
const { getGithubStats } = require("../services/githubService");

exports.getProfileStats = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const stats = await getGithubStats(username);

  res.status(200).json({
    success: true,
    data: stats
  });
});
