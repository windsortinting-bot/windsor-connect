"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Users, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/swipe", icon: Heart, label: "Swipe" },
    { href: "/matches", icon: Users, label: "Matches" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  // Hide navigation on these pages
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-around items-center z-50">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-xs ${
              isActive ? "text-rose-500" : "text-slate-400"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "fill-rose-500" : ""}`} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}