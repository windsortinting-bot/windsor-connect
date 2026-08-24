export type ProfileFields = {
  first_name?: string | null;
  age?: number | null;
  bio?: string | null;
  photo_urls?: string[] | null;
  neighborhood?: string | null;
  gender?: string | null;
  looking_for?: string | null;
};

export function profileCompleteness(p: ProfileFields): {
  score: number;
  missing: string[];
} {
  const checks: { key: string; ok: boolean }[] = [
    { key: "First name", ok: !!p.first_name?.trim() },
    { key: "Age", ok: typeof p.age === "number" && p.age > 0 },
    { key: "Photo", ok: Array.isArray(p.photo_urls) && p.photo_urls.length > 0 },
    { key: "Bio", ok: !!p.bio && p.bio.trim().length >= 20 },
    { key: "Neighborhood", ok: !!p.neighborhood?.trim() },
    { key: "Gender", ok: !!p.gender?.trim() },
    { key: "Looking for", ok: !!p.looking_for?.trim() },
  ];

  const missing = checks.filter((c) => !c.ok).map((c) => c.key);
  const score = Math.round(
    ((checks.length - missing.length) / checks.length) * 100
  );
  return { score, missing };
}