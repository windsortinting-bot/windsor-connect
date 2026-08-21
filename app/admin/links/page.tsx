"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import LogoutButton from "../../components/LogoutButton";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/overview", label: "Overview counts" },
  { href: "/admin/checklist", label: "Soft-launch checklist" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/support", label: "Support inbox" },
  { href: "/admin/feedback", label: "User feedback" },
  { href: "/admin/bugs", label: "Bug reports" },
  { href: "/admin/press", label: "Press leads" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/invites", label: "Invite codes" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/changelog", label: "Changelog" },
  { href: "/admin/flags", label: "Feature flags" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/notes", label: "Ops notes" },
  { href: "/whats-new", label: "Public what’s new" },
  { href: "/resources", label: "Resources hub" },
  { href: "/status", label: "Public status" },
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin menu</h1>
          <LogoutButton />
        </div>

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