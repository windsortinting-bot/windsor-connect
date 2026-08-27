"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LINKS = [
  { href: "/admin/users", label: "Users / ban" },
  { href: "/admin/invites", label: "Invite codes" },
  { href: "/admin/deletions", label: "Deletion queue" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/support", label: "Support tickets" },
  { href: "/admin/links", label: "Full admin menu" },
];

export default function AdminMenuExtraPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </button>
        <h1 className="text-3xl font-bold mb-6">Admin shortcuts</h1>
        <div className="space-y-3">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm text-left px-4"
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