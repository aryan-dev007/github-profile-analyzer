function normalizeLine(line) {
  return String(line || "").trim();
}

function stripItemPrefix(line) {
  return line
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[\.)]\s+/, "")
    .trim();
}

function detectHeading(line) {
  const match = /^(strengths|weaknesses|improvements)\s*:?(.*)$/i.exec(line);
  if (!match) return null;
  const key = match[1].toLowerCase();
  const remainder = normalizeLine(match[2]);
  return { key, remainder };
}

export function parseInsights(rawText) {
  const lines = (rawText || "")
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const sections = {
    strengths: [],
    weaknesses: [],
    improvements: []
  };

  let current = null;

  for (const line of lines) {
    const heading = detectHeading(line);
    if (heading) {
      current = heading.key;
      if (heading.remainder) {
        const cleaned = stripItemPrefix(heading.remainder);
        if (cleaned) sections[current].push(cleaned);
      }
      continue;
    }

    if (!current) continue;
    if (sections[current].length >= 3) continue;

    const cleaned = stripItemPrefix(line);
    if (cleaned) sections[current].push(cleaned);
  }

  return sections;
}
