"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/profile", label: "My profile" },
  { href: "/onboarding", label: "Edit profile" },
  { href: "/settings", label: "Settings" },
  { href: "/filters", label: "Discovery filters" },
  { href: "/activity", label: "Activity" },
  { href: "/resources", label: "Resources" },
  { href: "/feedback", label: "Send feedback" },
  { href: "/settings/export", label: "Export my data" },
  { href: "/invite", label: "Invite friends" },
];

export default function ProfileMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-6">Profile menu</h1>

        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl py-3 text-sm text-left px-4"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}