"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import LogoutButton from "../../components/LogoutButton";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/profile", label: "My profile" },
  { href: "/onboarding", label: "Edit profile" },
  { href: "/settings", label: "Settings" },
  { href: "/filters", label: "Discovery filters" },
  { href: "/activity", label: "Activity" },
  { href: "/resources", label: "Resources" },
  { href: "/feedback", label: "Send feedback" },
  { href: "/bug-report", label: "Report a bug" },
  { href: "/notifications-help", label: "Notifications help" },
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-700">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-6">Profile menu</h1>

        <div className="space-y-3 mb-8">
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

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <LogoutButton className="w-full justify-center text-rose-600 hover:text-rose-700 font-medium" />
        </div>
      </div>
    </div>
  );
}