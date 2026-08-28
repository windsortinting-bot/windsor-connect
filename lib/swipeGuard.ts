import { allowAction } from "./rateLimit";

export function canSwipeNow(userId: string): boolean {
  return allowAction(`swipe:${userId}`, 20, 10_000);
}

export function canMessageNow(userId: string): boolean {
  return allowAction(`msg:${userId}`, 8, 5_000);
}