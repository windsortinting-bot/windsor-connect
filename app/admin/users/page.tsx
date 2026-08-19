"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, Search } from "lucide-react";

interface UserRow {
  id: string;
  first_name: string | null;
  age: number | null;
  neighborhood: string | null;
  is_onboarded: boolean | null;
  is_paused: boolean | null;
  is_banned: boolean | null;
  created_at?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");

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

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, age, neighborhood, is_onboarded, is_paused, is_banned, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setMessage(error.message);
    else setRows((data as UserRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const toggleBan = async (row: UserRow) => {
    const next = !row.is_banned;
    if (!confirm(`${next ? "Ban" : "Unban"} ${row.first_name || "user"}?`))
      return;

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: next, is_paused: next ? true : row.is_paused })
      .eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, is_banned: next, is_paused: next ? true : r.is_paused } : r
      )
    );
  };

  const filtered = rows.filter((r) => {
    const hay = `${r.first_name || ""} ${r.neighborhood || ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading users...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Admin access required.</p>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 bg-slate-800 px-6 py-3 rounded-xl text-sm"
        >
          Back
        </button>
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

        <h1 className="text-3xl font-bold mb-2">Users</h1>
        <p className="text-slate-500 text-sm mb-4">Latest 100 profiles</p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or neighbourhood"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-rose-500"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {r.first_name || "No name"}
                    {r.age ? `, ${r.age}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.neighborhood || "No area"} ·{" "}
                    {r.is_onboarded ? "onboarded" : "incomplete"}
                    {r.is_paused ? " · paused" : ""}
                    {r.is_banned ? " · banned" : ""}
                  </p>
                </div>
                <button
                  onClick={() => toggleBan(r)}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${
                    r.is_banned
                      ? "border-emerald-500/40 text-emerald-400"
                      : "border-rose-500/40 text-rose-400"
                  }`}
                >
                  {r.is_banned ? "Unban" : "Ban"}
                </button>
              </div>
              <button
                onClick={() => router.push(`/profile/${r.id}`)}
                className="mt-3 w-full text-sm border border-slate-700 rounded-xl py-2 hover:bg-slate-800"
              >
                View profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}