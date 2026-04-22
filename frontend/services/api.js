import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const fallbackBaseUrls = Array.from({ length: 11 }, (_, idx) => `http://localhost:${5000 + idx}/api`);
const candidateBaseUrls = configuredBaseUrl
  ? [configuredBaseUrl, ...fallbackBaseUrls.filter((url) => url !== configuredBaseUrl)]
  : fallbackBaseUrls;

let resolvedBaseUrl = configuredBaseUrl || "";
let baseResolutionPromise = null;

async function isValidBackend(baseURL) {
  try {
    const response = await axios.get(`${baseURL}/health`, {
      timeout: 3000
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

  for (const baseURL of orderedBaseUrls) {
    // eslint-disable-next-line no-await-in-loop
    const isValid = await isValidBackend(baseURL);
    if (isValid) {
      resolvedBaseUrl = baseURL;
      return baseURL;
    }
  }

  throw new Error("Unable to connect to backend API");
}

async function getBackendBaseUrl() {
  if (resolvedBaseUrl) {
    const stillValid = await isValidBackend(resolvedBaseUrl);
    if (stillValid) return resolvedBaseUrl;
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

  throw lastConnectionError || new Error("Unable to connect to backend API");
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
  return response.data.data.insights;
}
