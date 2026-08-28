export type MatchQualityInput = {
  sameNeighborhood?: boolean;
  bothHavePhotos?: boolean;
  bothHaveBios?: boolean;
  lastActiveHours?: number | null;
};

export function matchQuality(input: MatchQualityInput): number {
  let score = 40;
  if (input.sameNeighborhood) score += 20;
  if (input.bothHavePhotos) score += 20;
  if (input.bothHaveBios) score += 10;
  if (input.lastActiveHours != null && input.lastActiveHours <= 24) score += 10;
  return Math.min(100, score);
}