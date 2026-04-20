const express = require("express");
const { getAIInsights } = require("../controllers/aiController");

const router = express.Router();

router.post("/", getAIInsights);

module.exports = router;
