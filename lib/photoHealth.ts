import { photoList } from "./images";

export type PhotoHealth = {
  count: number;
  hasPhoto: boolean;
  score: number;
  note: string;
};

export function photoHealth(urls?: string[] | null): PhotoHealth {
  const list = photoList(urls);
  const count = list.length;
  const hasPhoto = count > 0;
  const score = Math.min(100, count * 34);
  const note =
    count === 0
      ? "Add a clear face photo"
      : count === 1
      ? "One more photo helps matches"
      : "Photo set looks ready";

  return { count, hasPhoto, score, note };
}