const axios = require("axios");
const {
  GEMINI_API_KEY,
  GEMINI_MODEL,
  HUGGING_FACE_API_KEY,
  HUGGING_FACE_MODEL
} = require("../config/env");
const AppError = require("../utils/appError");
const { formatAIResponse } = require("../utils/formatAIResponse");

const geminiClient = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  timeout: 30000
});

const hfClient = axios.create({
  baseURL: "https://api-inference.huggingface.co/models",
  timeout: 30000
});

const GEMINI_DEFAULT_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest"
];

function extractProviderErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data?.error?.message === "string") {
    return data.error.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
    const firstDetail = data.error.details[0];
    if (typeof firstDetail === "string") {
      return firstDetail;
    }
  }

  return "";
}

function shouldFallbackToHuggingFace(error) {
  const status = error?.statusCode || error?.response?.status;
  const code = error?.code;

  if (!status) {
    return ["ECONNABORTED", "ECONNRESET", "ENOTFOUND", "ETIMEDOUT"].includes(code);
  }

  return status === 408 || status === 429 || status >= 500;
}

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

function buildLocalFallbackInsights(payload = {}) {
  const repos = Number(payload.repos || 0);
  const stars = Number(payload.stars || 0);
  const languagesCount = Array.isArray(payload.languages)
    ? payload.languages.length
    : 0;

  const strengths = [
    repos >= 10
      ? "Maintains a healthy number of public repositories."
      : "Has an initial project portfolio that can be expanded.",
    stars >= 20
      ? "Demonstrates visible community interest through stars."
      : "Has room to improve project discoverability and visibility.",
    languagesCount >= 3
      ? "Shows practical versatility across multiple languages."
      : "Can increase stack breadth with a few focused language additions."
  ];

  const weaknesses = [
    "Live AI provider response is temporarily unavailable.",
    repos < 10
      ? "Repository volume is still growing and may limit profile depth."
      : "Repository quality signals can be strengthened with better documentation.",
    stars < 20
      ? "Star count indicates opportunity to improve project reach."
      : "Some strong projects may still need clearer technical positioning."
  ];

  const improvements = [
    "Add polished READMEs and architecture notes to top repositories.",
    "Prioritize one flagship project with tests, CI, and releases.",
    "Re-run AI insights later for refreshed qualitative analysis."
  ];

  return formatAIResponse(
    [
      "Strengths:",
      `1. ${strengths[0]}`,
      `2. ${strengths[1]}`,
      `3. ${strengths[2]}`,
      "",
      "Weaknesses:",
      `1. ${weaknesses[0]}`,
      `2. ${weaknesses[1]}`,
      `3. ${weaknesses[2]}`,
      "",
      "Improvements:",
      `1. ${improvements[0]}`,
      `2. ${improvements[1]}`,
      `3. ${improvements[2]}`
    ].join("\n")
  );
}

async function generateAIInsights(payload) {
  if (!GEMINI_API_KEY && !HUGGING_FACE_API_KEY) {
    return buildLocalFallbackInsights(payload);
  }

  let geminiError = null;
  let huggingFaceError = null;

  if (GEMINI_API_KEY) {
    try {
      return await generateWithGemini(payload);
    } catch (error) {
      geminiError = error;

      if (!HUGGING_FACE_API_KEY || !shouldFallbackToHuggingFace(error)) {
        throw error;
      }
    }
  }

  if (HUGGING_FACE_API_KEY) {
    try {
      return await generateWithHuggingFace(payload);
    } catch (error) {
      huggingFaceError = error;
    }
  }

  if (geminiError || huggingFaceError) {
    const geminiMessage = geminiError?.message ? `Gemini: ${geminiError.message}` : "";
    const hfMessage = huggingFaceError?.message ? `HuggingFace: ${huggingFaceError.message}` : "";
    const errorSummary = [geminiMessage, hfMessage].filter(Boolean).join(" | ");
    console.warn(
      `AI providers unavailable. Serving local fallback insights.${
        errorSummary ? ` ${errorSummary}` : ""
      }`
    );
  }

  return buildLocalFallbackInsights(payload);
}

function buildGeminiModelCandidates() {
  const candidates = [GEMINI_MODEL, ...GEMINI_DEFAULT_MODEL_CANDIDATES]
    .map((model) => (typeof model === "string" ? model.trim() : ""))
    .filter(Boolean);

  return [...new Set(candidates)];
}

async function generateWithGemini(payload) {
  const modelsToTry = buildGeminiModelCandidates();
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await geminiClient.post(
        `/models/${model}:generateContent`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(payload) }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400
          }
        },
        {
          params: {
            key: GEMINI_API_KEY
          }
        }
      );

      const data = response.data;
      const rawText =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part?.text || "")
          .join("\n") || "";

      if (!rawText.trim()) {
        throw new AppError("AI API returned an empty response", 502);
      }

      return formatAIResponse(rawText);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const providerMessage = extractProviderErrorMessage(error);
      const status = error.response?.status;

      if (status === 404) {
        lastError = new AppError(
          providerMessage || `Gemini model not found: ${model}`,
          404
        );
        continue;
      }

      if (status === 401 || status === 403) {
        throw new AppError(
          providerMessage || "Gemini API key is invalid or unauthorized",
          status
        );
      }

      if (status === 429) {
        throw new AppError("AI rate limit reached. Try again shortly.", 429);
      }

      if (status === 400) {
        throw new AppError(
          providerMessage || "Invalid AI request payload or Gemini model configuration",
          400
        );
      }

      throw new AppError(providerMessage || "Gemini AI API failure", 502);
    }
  }

  throw lastError || new AppError("Gemini model configuration is invalid", 400);
}

async function generateWithHuggingFace(payload) {
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

    if (!rawText.trim()) {
      throw new AppError("AI API returned an empty response", 502);
    }

    return formatAIResponse(rawText);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    const providerMessage = extractProviderErrorMessage(error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new AppError(
        providerMessage || "Hugging Face API key is invalid or unauthorized",
        error.response.status
      );
    }

    if (error.response?.status === 503) {
      throw new AppError("AI model is loading. Try again in a moment.", 503);
    }

    throw new AppError(providerMessage || "Hugging Face AI API failure", 502);
  }
}

module.exports = {
  generateAIInsights
};
