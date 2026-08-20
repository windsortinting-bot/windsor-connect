export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function displayName(
  firstName: string | null | undefined,
  age?: number | null
) {
  const name = firstName?.trim() || "Member";
  return age ? `${name}, ${age}` : name;
}

export function kidsStatusLabel(status?: string | null) {
  if (status === "have_kids") return "Has kids";
  if (status === "no_kids") return "No kids";
  return null;
}

export function kidsPrefLabel(pref?: string | null) {
  if (pref === "want") return "Wants kids";
  if (pref === "dont_want") return "Doesn’t want kids";
  if (pref === "already_have") return "Already has kids";
  if (pref === "open") return "Open to kids";
  return null;
}