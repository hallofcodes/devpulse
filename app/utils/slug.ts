export function toKebabSlug(value: string, fallback = "item") {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}