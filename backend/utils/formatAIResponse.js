function parseSection(lines, heading) {
  const sectionStart = lines.findIndex(
    (line) => line.trim().toLowerCase() === heading.toLowerCase()
  );

  if (sectionStart === -1) return [];

  const items = [];
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const normalized = lines[i].trim();

    if (!normalized) continue;
    if (
      normalized.toLowerCase() === "strengths:" ||
      normalized.toLowerCase() === "weaknesses:" ||
      normalized.toLowerCase() === "improvements:"
    ) {
      break;
    }

    const cleaned = normalized.replace(/^\d+\.\s*/, "");
    items.push(cleaned);
    if (items.length === 3) break;
  }

  return items;
}

function normalizeToThree(items, fallback) {
  const normalized = [...items];
  while (normalized.length < 3) {
    normalized.push(fallback[normalized.length]);
  }
  return normalized.slice(0, 3);
}

function formatAIResponse(rawText) {
  const lines = (rawText || "").split("\n");

  const strengths = normalizeToThree(parseSection(lines, "Strengths:"), [
    "Builds and ships repositories consistently.",
    "Demonstrates solid collaboration through forks and stars.",
    "Shows practical language breadth across projects."
  ]);

  const weaknesses = normalizeToThree(parseSection(lines, "Weaknesses:"), [
    "Repository descriptions may not clearly communicate impact.",
    "Recent activity can be uneven across projects.",
    "Language specialization depth can be improved."
  ]);

  const improvements = normalizeToThree(parseSection(lines, "Improvements:"), [
    "Prioritize one flagship project with polished documentation.",
    "Increase contribution cadence with weekly meaningful commits.",
    "Add tests, CI, and clear release notes for top repositories."
  ]);

  return [
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
  ].join("\n");
}

module.exports = {
  formatAIResponse
};
