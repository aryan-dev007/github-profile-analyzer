const axios = require("axios");
const {
  GEMINI_API_KEY,
  GEMINI_MODEL
} = require("../config/env");
const AppError = require("../utils/appError");
const { formatAIResponse } = require("../utils/formatAIResponse");

const geminiClient = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
  timeout: 30000
});

const AI_INSIGHTS_CACHE_TTL_MS = 10 * 60 * 1000;
const AI_MAX_RETRIES = 3;
const AI_RETRY_BASE_DELAY_MS = 500;
const AI_RETRY_MAX_DELAY_MS = 8000;
const aiInsightsCache = new Map();
const aiInsightsInflight = new Map();

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPayloadKey(payload) {
  const languages = Array.isArray(payload?.languages)
    ? [...payload.languages].map(String).sort()
    : [String(payload?.languages || "")];

  return JSON.stringify({
    repos: payload?.repos || 0,
    stars: payload?.stars || 0,
    languages
  });
}

function getCachedInsights(cacheKey) {
  const cached = aiInsightsCache.get(cacheKey);
  if (!cached) return null;

  if (cached.expiresAt <= Date.now()) {
    aiInsightsCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function setCachedInsights(cacheKey, data) {
  aiInsightsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + AI_INSIGHTS_CACHE_TTL_MS
  });
}

function getRetryDelayMs(attempt, retryAfterHeader) {
  const retryAfterSeconds = Number(retryAfterHeader);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return Math.min(retryAfterSeconds * 1000, AI_RETRY_MAX_DELAY_MS);
  }

  const jitter = Math.floor(Math.random() * 200);
  const delay = AI_RETRY_BASE_DELAY_MS * 2 ** attempt + jitter;
  return Math.min(delay, AI_RETRY_MAX_DELAY_MS);
}

function shouldRetryGemini(error) {
  if (!error?.response) return true;

  const status = error.response?.status;
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}
async function generateAIInsights(payload) {
  if (!GEMINI_API_KEY) {
    throw new AppError(
      "No AI provider configured. Set GEMINI_API_KEY to enable live Gemini insights.",
      500
    );
  }

  const cacheKey = buildPayloadKey(payload);
  const cached = getCachedInsights(cacheKey);
  if (cached) return cached;

  if (aiInsightsInflight.has(cacheKey)) {
    return aiInsightsInflight.get(cacheKey);
  }

  const inflight = generateWithGemini(payload)
    .then((insights) => {
      setCachedInsights(cacheKey, insights);
      return insights;
    })
    .finally(() => {
      aiInsightsInflight.delete(cacheKey);
    });

  aiInsightsInflight.set(cacheKey, inflight);
  return inflight;
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
      const response = await callGeminiWithRetry(model, payload);

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

async function callGeminiWithRetry(model, payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      return await geminiClient.post(
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
    } catch (error) {
      lastError = error;
      if (!shouldRetryGemini(error) || attempt === AI_MAX_RETRIES) {
        break;
      }

      const retryAfterHeader = error?.response?.headers?.["retry-after"];
      const delayMs = getRetryDelayMs(attempt, retryAfterHeader);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

module.exports = {
  generateAIInsights
};
