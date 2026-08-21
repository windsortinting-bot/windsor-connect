"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function AdminHealthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [apiOk, setApiOk] = useState(false);
  const [dbOk, setDbOk] = useState(false);
  const [version, setVersion] = useState<string>("");

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

      if (!me?.is_admin) {
        setDenied(true);
        setLoading(false);
        return;
      }

      try {
        const health = await fetch("/api/health").then((r) => r.json());
        setApiOk(!!health?.ok);
      } catch {
        setApiOk(false);
      }

      try {
        const ver = await fetch("/api/version").then((r) => r.json());
        setVersion(ver?.version || "");
      } catch {
        setVersion("");
      }

      const { error } = await supabase.from("profiles").select("id").limit(1);
      setDbOk(!error);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Checking systems...
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

  const rows = [
    { label: "API /health", ok: apiOk },
    { label: "Database read", ok: dbOk },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">System health</h1>
        <p className="text-slate-500 text-sm mb-8">
          Version {version || "unknown"}
        </p>

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.label}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between"
            >
              <span className="text-sm">{r.label}</span>
              <span
                className={`text-xs font-semibold ${
                  r.ok ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {r.ok ? "OK" : "FAIL"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}