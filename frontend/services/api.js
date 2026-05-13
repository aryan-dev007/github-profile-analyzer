import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
// Reduce the number of fallback ports to check and favor quick health checks
// Prefer same-origin relative API first (works in Vite dev and production),
// then local ports.
const fallbackBaseUrls = [
  "/api",
  ...Array.from({ length: 3 }, (_, idx) => `http://localhost:${5000 + idx}/api`)
];
const candidateBaseUrls = configuredBaseUrl
  ? [configuredBaseUrl, ...fallbackBaseUrls.filter((url) => url !== configuredBaseUrl)]
  : fallbackBaseUrls;

let resolvedBaseUrl = configuredBaseUrl || "";
let resolvedAt = 0;
const RESOLVE_TTL_MS = 60 * 1000; // 1 minute cache for resolved base URL
let baseResolutionPromise = null;

async function isValidBackend(baseURL) {
  try {
    const response = await axios.get(`${baseURL}/health`, {
      timeout: 1000
    });

    return (
      response?.data?.ok === true &&
      response?.data?.service === "github-profile-analyzer-backend"
    );
  } catch (error) {
    return false;
  }
}

async function resolveBackendBaseUrl() {
  const orderedBaseUrls = resolvedBaseUrl
    ? [resolvedBaseUrl, ...candidateBaseUrls.filter((url) => url !== resolvedBaseUrl)]
    : candidateBaseUrls;

  // Do quick parallel health checks and pick the first successful one
  const checks = orderedBaseUrls.map((baseURL) =>
    (async () => {
      const ok = await isValidBackend(baseURL);
      if (ok) return baseURL;
      throw new Error(`no:${baseURL}`);
    })()
  );

  try {
    const winner = await Promise.any(checks);
    resolvedBaseUrl = winner;
    resolvedAt = Date.now();
    return winner;
  } catch (err) {
    // If Promise.any fails (all rejected), fall back to sequential attempt for best error message
    for (const baseURL of orderedBaseUrls) {
      // eslint-disable-next-line no-await-in-loop
      const isValid = await isValidBackend(baseURL);
      if (isValid) {
        resolvedBaseUrl = baseURL;
        resolvedAt = Date.now();
        return baseURL;
      }
    }
    throw new Error("Unable to connect to backend API");
  }
}

async function getBackendBaseUrl() {
  if (resolvedBaseUrl && Date.now() - resolvedAt < RESOLVE_TTL_MS) {
    return resolvedBaseUrl;
  }

  if (!baseResolutionPromise) {
    baseResolutionPromise = resolveBackendBaseUrl().finally(() => {
      baseResolutionPromise = null;
    });
  }

  return baseResolutionPromise;
}

function isNetworkError(error) {
  return !error?.response;
}

function isRetriableServerError(error) {
  const status = error?.response?.status;
  return typeof status === "number" && status >= 500;
}

async function requestWithAutoBase(requestConfig) {
  const preferredBaseUrl = await getBackendBaseUrl();
  const orderedBaseUrls = [
    preferredBaseUrl,
    ...candidateBaseUrls.filter((url) => url !== preferredBaseUrl)
  ];

  let lastConnectionError = null;

  for (const baseURL of orderedBaseUrls) {
    try {
      const response = await axios({
        ...requestConfig,
        baseURL,
        timeout: 20000
      });

      resolvedBaseUrl = baseURL;
      return response;
    } catch (error) {
      if (isNetworkError(error)) {
        lastConnectionError = error;
        resolvedBaseUrl = "";
        continue;
      }

      if (isRetriableServerError(error)) {
        lastConnectionError = error;
        resolvedBaseUrl = "";
        continue;
      }

      throw error;
    }
  }

  const tried = orderedBaseUrls.join(", ");
  const msg =
    (lastConnectionError && lastConnectionError.message) || "Unable to connect to backend API";
  const err = new Error(`Unable to connect to backend. Tried: ${tried}. Last: ${msg}`);
  err.cause = lastConnectionError;
  throw err;
}

export async function fetchGithubStats(username) {
  const response = await requestWithAutoBase({
    method: "get",
    url: `/github/${username}`
  });
  return response.data.data;
}

export async function fetchDeveloperScore(username) {
  const response = await requestWithAutoBase({
    method: "get",
    url: `/score/${username}`
  });
  return response.data.data;
}

export async function fetchAIInsights(payload) {
  const response = await requestWithAutoBase({
    method: "post",
    url: "/ai-insights",
    data: payload
  });
  // Return both insights text and heuristic flag (if backend used fallback)
  return {
    insights: response.data.data.insights,
    heuristic: Boolean(response.data.data.heuristic)
  };
}
