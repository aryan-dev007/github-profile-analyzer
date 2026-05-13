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
  GITHUB_COOLDOWN_MS: Number(process.env.GITHUB_COOLDOWN_MS) || 15000,
  GROQ_API_KEY: sanitizeEnvValue(process.env.GROQ_API_KEY),
  GROQ_MODEL: sanitizeEnvValue(process.env.GROQ_MODEL, "llama-3.3-70b-versatile"),
  HUGGING_FACE_API_KEY: sanitizeEnvValue(process.env.HUGGING_FACE_API_KEY),
  HUGGING_FACE_MODEL:
    sanitizeEnvValue(
      process.env.HUGGING_FACE_MODEL,
      "mistralai/Mistral-7B-Instruct-v0.2"
    )
};
