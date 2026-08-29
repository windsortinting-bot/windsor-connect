export function isQuietHoursNow(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem("wc_quiet_hours");
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.enabled) return false;
    const [sh, sm] = String(parsed.start || "22:00").split(":").map(Number);
    const [eh, em] = String(parsed.end || "08:00").split(":").map(Number);
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start === end) return true;
    if (start < end) return cur >= start && cur < end;
    return cur >= start || cur < end;
  } catch {
    return false;
  }
}