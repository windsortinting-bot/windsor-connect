export type LaunchItem = {
  href: string;
  label: string;
  why: string;
};

export const LAUNCH_PATH: LaunchItem[] = [
  { href: "/profile", label: "Check your profile", why: "Photo and name must show." },
  { href: "/swipe", label: "Swipe 5 cards", why: "Confirm people appear." },
  { href: "/likes", label: "Open likes", why: "Confirm incoming likes load." },
  { href: "/matches", label: "Open matches", why: "Confirm match list is unique." },
  { href: "/messages", label: "Open chat list", why: "Confirm threads load." },
  { href: "/settings", label: "Find Log out", why: "You must be able to leave the account." },
];
