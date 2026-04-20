const axios = require("axios");
const {
  HUGGING_FACE_API_KEY,
  HUGGING_FACE_MODEL
} = require("../config/env");
const AppError = require("../utils/appError");
const { formatAIResponse } = require("../utils/formatAIResponse");

const hfClient = axios.create({
  baseURL: "https://api-inference.huggingface.co/models",
  timeout: 30000
});

function buildPrompt({ repos, stars, languages }) {
  return [
    "You are a technical reviewer.",
    "Analyze this GitHub developer profile and answer in the exact format below.",
    "",
    `Repos: ${repos}`,
    `Stars: ${stars}`,
    `Languages: ${Array.isArray(languages) ? languages.join(", ") : languages}`,
    "",
    "Output format STRICT:",
    "Strengths:",
    "1.",
    "2.",
    "3.",
    "",
    "Weaknesses:",
    "1.",
    "2.",
    "3.",
    "",
    "Improvements:",
    "1.",
    "2.",
    "3."
  ].join("\n");
}

async function generateAIInsights(payload) {
  if (!HUGGING_FACE_API_KEY) {
    throw new AppError("AI service is not configured", 500);
  }

  try {
    const response = await hfClient.post(
      `/${HUGGING_FACE_MODEL}`,
      {
        inputs: buildPrompt(payload),
        parameters: {
          max_new_tokens: 350,
          temperature: 0.4,
          return_full_text: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;
    const rawText = Array.isArray(data)
      ? data[0]?.generated_text || ""
      : data.generated_text || "";

    return formatAIResponse(rawText);
  } catch (error) {
    if (error.response?.status === 503) {
      throw new AppError("AI model is loading. Try again in a moment.", 503);
    }

    throw new AppError("AI API failure", 502);
  }
}

module.exports = {
  generateAIInsights
};
