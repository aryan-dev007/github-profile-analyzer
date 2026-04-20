const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  HUGGING_FACE_API_KEY: process.env.HUGGING_FACE_API_KEY || "",
  HUGGING_FACE_MODEL:
    process.env.HUGGING_FACE_MODEL || "mistralai/Mistral-7B-Instruct-v0.2"
};
