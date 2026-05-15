import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("Missing VITE_API_URL. Add it to frontend/.env.");
}

const apiClient = axios.create({
  baseURL: API_URL || "",
  timeout: 20000
});

export async function fetchGithubStats(username) {
  const response = await apiClient.get(`/api/github/${username}`);
  return response.data.data;
}

export async function fetchDeveloperScore(username) {
  const response = await apiClient.get(`/api/score/${username}`);
  return response.data.data;
}

export async function fetchAIInsights(payload) {
  const response = await apiClient.post("/api/ai-insights", payload);
  // Return both insights text and heuristic flag (if backend used fallback)
  return {
    insights: response.data.data.insights,
    heuristic: Boolean(response.data.data.heuristic)
  };
}
