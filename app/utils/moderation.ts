const DEFAULT_REPLACEMENT_TEXT = "System says: touch grass first 🌱";

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildWordFilter(blocklist: string[]) {
  const sanitizedWords = Array.from(
    new Set(
      blocklist
        .map((word) => word.trim())
        .filter(Boolean)
        .map((word) => escapeRegExp(word)),
    ),
  );

  if (sanitizedWords.length === 0) return null;

  return new RegExp(`\\b(${sanitizedWords.join("|")})\\b`, "gi");
}

export function sanitizeTextWithBlocklist(
  input: string,
  blocklist: string[],
  replacement = DEFAULT_REPLACEMENT_TEXT,
) {
  if (!blocklist.length) return input;

  const filter = buildWordFilter(blocklist);
  if (!filter) return input;

  return input.replace(filter, replacement);
}

export function hasBlocklistedWord(input: string, blocklist: string[]) {
  if (!input || !blocklist.length) return false;

  const filter = buildWordFilter(blocklist);
  if (!filter) return false;

  filter.lastIndex = 0;
  return filter.test(input);
}