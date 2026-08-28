export function firstPhoto(urls?: string[] | null): string | null {
  if (!Array.isArray(urls) || urls.length === 0) return null;
  const url = (urls[0] || "").trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image")) {
    return url;
  }
  return null;
}

export function photoList(urls?: string[] | null): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((u) => (u || "").trim())
    .filter((u) => u.startsWith("http://") || u.startsWith("https://"));
}