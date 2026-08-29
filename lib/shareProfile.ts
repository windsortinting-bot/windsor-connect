export function profileShareText(name: string, neighborhood?: string | null) {
  const place = neighborhood || "Windsor";
  return `I'm on Windsor Connect in ${place}. Look for ${name}.`;
}

export function inviteShareText(code = "WINDSOR519") {
  return `Join Windsor Connect with code ${code}. City-first dating for Windsor.`;
}