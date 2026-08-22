"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/about", label: "About Windsor Connect" },
  { href: "/announcements", label: "Announcements" },
  { href: "/whats-new", label: "What’s new" },
  { href: "/daily-prompt", label: "Daily prompt" },
  { href: "/wins", label: "Small wins" },
  { href: "/checkin", label: "Quick check-in" },
  { href: "/intent", label: "Dating intent" },
  { href: "/pre-date", label: "Pre-date checklist" },
  { href: "/after-date", label: "After-date notes" },
  { href: "/conversation-pace", label: "Conversation pace" },
  { href: "/message-templates", label: "Message templates" },
  { href: "/compliment-ideas", label: "Compliment ideas" },
  { href: "/profile-examples", label: "Profile examples" },
  { href: "/green-flags", label: "Green flags" },
  { href: "/red-flags", label: "Red flags" },
  { href: "/boundaries", label: "Personal boundaries" },
  { href: "/connection-quality", label: "Connection quality" },
  { href: "/self-care", label: "Dating self-care" },
  { href: "/weekend-plan", label: "Weekend plan" },
  { href: "/local-glossary", label: "Local glossary" },
  { href: "/ideas", label: "Date ideas" },
  { href: "/faq", label: "FAQ" },
  { href: "/safety", label: "Safety tips" },
  { href: "/meet-safe", label: "Meet safely checklist" },
  { href: "/support", label: "Contact support" },
  { href: "/feedback", label: "Send feedback" },
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
          Help, safety, and practical dating guides
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