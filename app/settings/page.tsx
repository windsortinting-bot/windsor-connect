"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/settings/chat", label: "Chat settings" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/filters", label: "Discovery filters" },
  { href: "/blocked", label: "Blocked users" },
  { href: "/pause", label: "Pause profile" },
  { href: "/invite", label: "Invite codes" },
  { href: "/support", label: "Support" },
  { href: "/safety", label: "Safety tips" },
  { href: "/profile-score", label: "Profile strength" },
  { href: "/settings/export", label: "Export my data" },
  { href: "/delete-account", label: "Delete account" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className={`w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm text-left px-4 ${
                l.href === "/delete-account" ? "text-rose-600" : ""
              }`}
              type="button"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}