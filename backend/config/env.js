const dotenv = require("dotenv");

dotenv.config();

function sanitizeEnvValue(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(/^['\"]|['\"]$/g, "");
}

module.exports = {
  PORT: process.env.PORT || 5000,
  GITHUB_TOKEN: sanitizeEnvValue(process.env.GITHUB_TOKEN),
  GEMINI_API_KEY: sanitizeEnvValue(process.env.GEMINI_API_KEY),
  GEMINI_MODEL: sanitizeEnvValue(process.env.GEMINI_MODEL, "gemini-2.0-flash"),
  HUGGING_FACE_API_KEY: sanitizeEnvValue(process.env.HUGGING_FACE_API_KEY),
  HUGGING_FACE_MODEL:
    sanitizeEnvValue(
      process.env.HUGGING_FACE_MODEL,
      "mistralai/Mistral-7B-Instruct-v0.2"
    )
};
