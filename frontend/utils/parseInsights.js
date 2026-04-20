function extractSection(lines, title) {
  const heading = `${title.toLowerCase()}:`;
  const start = lines.findIndex((line) => line.toLowerCase() === heading);
  if (start === -1) return [];

  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const lower = line.toLowerCase();
    if (lower === "strengths:" || lower === "weaknesses:" || lower === "improvements:") {
      break;
    }

    out.push(line.replace(/^\d+\.\s*/, ""));
    if (out.length === 3) break;
  }

  return out;
}

export function parseInsights(rawText) {
  const lines = (rawText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    strengths: extractSection(lines, "Strengths"),
    weaknesses: extractSection(lines, "Weaknesses"),
    improvements: extractSection(lines, "Improvements")
  };
}
