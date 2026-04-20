const express = require("express");
const { getProfileStats } = require("../controllers/githubController");

const router = express.Router();

router.get("/:username", getProfileStats);

module.exports = router;
