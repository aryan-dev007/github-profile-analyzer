const express = require("express");
const { getDeveloperScore } = require("../controllers/scoreController");

const router = express.Router();

router.get("/:username", getDeveloperScore);

module.exports = router;
