export function hoursSince(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return (Date.now() - t) / 36e5;
}

export function freshnessLabel(iso?: string | null): string {
  const hours = hoursSince(iso);
  if (hours == null) return "Activity unknown";
  if (hours < 1) return "Active just now";
  if (hours < 24) return "Active today";
  if (hours < 72) return "Active this week";
  return "Quiet lately";
}