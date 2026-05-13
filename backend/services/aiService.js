const OpenAI = require("openai");
const {
  GROQ_API_KEY,
  GROQ_MODEL
} = require("../config/env");
const AppError = require("../utils/appError");
const { formatAIResponse } = require("../utils/formatAIResponse");

const groqClient = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const AI_INSIGHTS_CACHE_TTL_MS = 10 * 60 * 1000;
const AI_MAX_RETRIES = 3;
const AI_RETRY_BASE_DELAY_MS = 500;
const AI_RETRY_MAX_DELAY_MS = 8000;
const aiInsightsCache = new Map();
const aiInsightsInflight = new Map();

const GROQ_DEFAULT_MODEL_CANDIDATES = [
  "llama3-70b-8192",
  "llama3-8b-8192"
];

function extractProviderErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof error?.error?.message === "string") {
    return error.error.message;
  }

  if (typeof data?.error?.message === "string") {
    return data.error.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof error?.message === "string") {
    return error.message;
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

function shouldRetryGroq(error) {
  const status = error?.status || error?.response?.status;
  if (!status) return true;
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

async function generateAIInsights(payload) {
  if (!GROQ_API_KEY) {
    throw new AppError("GROQ_API_KEY is required to generate AI insights", 400);
  }

  const cacheKey = buildPayloadKey(payload);
  const cached = getCachedInsights(cacheKey);
  if (cached) return cached;

  if (aiInsightsInflight.has(cacheKey)) {
    return aiInsightsInflight.get(cacheKey);
  }

  const inflight = generateWithGroq(payload)
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

function buildGroqModelCandidates() {
  const candidates = [GROQ_MODEL, ...GROQ_DEFAULT_MODEL_CANDIDATES]
    .map((model) => (typeof model === "string" ? model.trim() : ""))
    .filter(Boolean);

  return [...new Set(candidates)];
}

async function generateWithGroq(payload) {
  const modelsToTry = buildGroqModelCandidates();
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await callGroqWithRetry(model, payload);
      const rawText = response?.choices?.[0]?.message?.content || "";

      if (!rawText.trim()) {
        throw new AppError("AI API returned an empty response", 502);
      }

      return formatAIResponse(rawText);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const providerMessage = extractProviderErrorMessage(error);
      const status = error?.status || error.response?.status;

      if (status === 404) {
        lastError = new AppError(
          providerMessage || `Groq model not found: ${model}`,
          404
        );
        continue;
      }

      if (status === 401 || status === 403) {
        throw new AppError(
          providerMessage || "Groq API key is invalid or unauthorized",
          status
        );
      }

      if (status === 429) {
        throw new AppError("AI rate limit reached. Try again shortly.", 429);
      }

      if (status === 400) {
        throw new AppError(
          providerMessage || "Invalid AI request payload or Groq model configuration",
          400
        );
      }

      throw new AppError(providerMessage || "Groq AI API failure", 502);
    }
  }

  throw lastError || new AppError("Groq model configuration is invalid", 400);
}

async function callGroqWithRetry(model, payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      return await groqClient.chat.completions.create({
        model,
        messages: [{ role: "user", content: buildPrompt(payload) }],
        temperature: 0.4,
        max_tokens: 400
      });
    } catch (error) {
      lastError = error;

      if (attempt < AI_MAX_RETRIES && shouldRetryGroq(error)) {
        const retryAfter = error?.response?.headers?.["retry-after"];
        await sleep(getRetryDelayMs(attempt, retryAfter));
        continue;
      }
    }
  }

  throw lastError;
}

module.exports = {
  generateAIInsights
};
