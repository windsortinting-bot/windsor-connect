"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/about", label: "About Windsor Connect" },
  { href: "/announcements", label: "Announcements" },
  { href: "/whats-new", label: "What’s new" },
  { href: "/changelog", label: "Changelog" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/shipping", label: "Shipping status" },
  { href: "/community", label: "Community values" },
  { href: "/faq", label: "FAQ" },
  { href: "/checkin", label: "Quick check-in" },
  { href: "/intent", label: "Dating intent" },
  { href: "/boundaries", label: "Personal boundaries" },
  { href: "/red-flags", label: "Red flags" },
  { href: "/local-glossary", label: "Local glossary" },
  { href: "/compliment-ideas", label: "Compliment ideas" },
  { href: "/first-week", label: "First-week plan" },
  { href: "/profile-checklist", label: "Profile checklist" },
  { href: "/welcome-back", label: "Welcome back" },
  { href: "/ideas", label: "Date ideas" },
  { href: "/saved-ideas", label: "Saved date ideas" },
  { href: "/conversation-starters", label: "Conversation starters" },
  { href: "/guidelines", label: "Community guidelines" },
  { href: "/moderation", label: "Moderation policy" },
  { href: "/report-status", label: "After you report" },
  { href: "/safety", label: "Safety tips" },
  { href: "/meet-safe", label: "Meet safely checklist" },
  { href: "/tips", label: "Dating tips" },
  { href: "/photo-tips", label: "Photo tips" },
  { href: "/neighborhoods", label: "Neighbourhoods" },
  { href: "/notes", label: "Private match notes" },
  { href: "/install", label: "Install the app" },
  { href: "/quiet-hours", label: "Quiet hours" },
  { href: "/timezone", label: "Timezone" },
  { href: "/data-use", label: "How we use data" },
  { href: "/cookies", label: "Cookies & storage" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/age-notice", label: "Age requirement" },
  { href: "/press", label: "Press & partners" },
  { href: "/support", label: "Contact support" },
  { href: "/feedback", label: "Send feedback" },
  { href: "/bug-report", label: "Report a bug" },
  { href: "/security", label: "Security" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/status", label: "Service status" },
];

export default function ResourcesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-slate-500 text-sm mb-8">
          Help, safety, local guides, and policies
        </p>

        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm text-left px-4"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}