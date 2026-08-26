/**
 * Formats the given number of seconds as a human-readable string representing the number of hours and minutes.
 *
 * @param seconds The number/string of seconds to format.
 * @returns A human-readable string representing the number of hours and minutes, or `null` if the input is invalid.
 */
export function formatHours(seconds: string | number) {
  try {
    const safeSeconds = Number(seconds);
    if (!Number.isFinite(safeSeconds)) return "N/A";

    const totalMinutes = Math.ceil(safeSeconds / 60);

    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  } catch {
    console.error("Invalid seconds:", seconds);
    return "N/A";
  }
}

/**
 * Returns a human-readable string representing the time elapsed since the given timestamp.
 *
 * @param timestamp The timestamp to compare against the current time.
 * @returns A human-readable string representing the time elapsed since the given timestamp, or `null` if the timestamp is invalid.
 */
export function timeAgo(timestamp: string | null | undefined) {
  if (!timestamp) return null;

  // support both ISO strings and unix-seconds strings
  const isNumeric = /^\d+$/.test(timestamp.trim());
  const timestampMs = isNumeric
    ? Number(timestamp) * 1000
    : new Date(timestamp).getTime();

  if (Number.isNaN(timestampMs)) return null;

  const diffSeconds = Math.floor((Date.now() - timestampMs) / 1000);
  if (diffSeconds < 0) return "just now"; // guard against clock skew

  if (diffSeconds < 60)
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}
