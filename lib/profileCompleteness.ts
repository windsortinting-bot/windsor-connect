export function profileCompleteness(profile: {
  first_name?: string | null;
  age?: number | null;
  bio?: string | null;
  photo_urls?: string[] | null;
  neighborhood?: string | null;
  prompt_1_answer?: string | null;
  prompt_2_answer?: string | null;
  prompt_3_answer?: string | null;
  height?: string | null;
}) {
  let score = 0;
  const missing: string[] = [];

  if (profile.first_name) score += 15;
  else missing.push("name");

  if (profile.age) score += 10;
  else missing.push("age");

  if (profile.neighborhood) score += 10;
  else missing.push("neighborhood");

  if (profile.bio && profile.bio.trim().length > 10) score += 15;
  else missing.push("bio");

  const photos = profile.photo_urls?.length || 0;
  if (photos >= 1) score += 15;
  else missing.push("photo");
  if (photos >= 2) score += 10;
  if (photos >= 3) score += 5;

  if (profile.prompt_1_answer) score += 7;
  if (profile.prompt_2_answer) score += 7;
  if (profile.prompt_3_answer) score += 6;
  if (!profile.prompt_1_answer && !profile.prompt_2_answer) {
    missing.push("prompts");
  }

  if (profile.height) score += 5;

  return {
    score: Math.min(100, score),
    missing,
    isLow: score < 60,
  };
}