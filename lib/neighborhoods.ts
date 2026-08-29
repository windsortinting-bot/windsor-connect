export const WINDSOR_NEIGHBORHOODS = [
  "Walkerville",
  "Downtown",
  "Ford City",
  "Riverside",
  "South Windsor",
  "University of Windsor",
];

export function isKnownNeighborhood(value?: string | null): boolean {
  if (!value) return false;
  return WINDSOR_NEIGHBORHOODS.includes(value);
}