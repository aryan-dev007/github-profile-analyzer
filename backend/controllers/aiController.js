const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { generateAIInsights } = require("../services/aiService");

exports.getAIInsights = asyncHandler(async (req, res) => {
  const { repos, stars, languages } = req.body;

  if (repos === undefined || stars === undefined || !languages) {
    throw new AppError("repos, stars, and languages are required", 400);
  }

  const insights = await generateAIInsights({ repos, stars, languages });

  res.status(200).json({
    success: true,
    data: {
      insights
    }
  });
});
