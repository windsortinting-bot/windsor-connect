"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/invites", label: "Invite codes" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/flags", label: "Feature flags" },
];

export default function AdminLinksPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
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
      const { data: me } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (!me?.is_admin) setDenied(true);
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

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>
        <h1 className="text-3xl font-bold mb-6">Admin menu</h1>
        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl py-3 text-sm"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}