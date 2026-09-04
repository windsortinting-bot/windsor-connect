"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Users, Flag, Ticket, Search } from "lucide-react";

async function safeCount(table: string, filter?: (q: any) => any) {
  try {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

type ProfileRow = {
  id: string;
  first_name: string | null;
  neighborhood: string | null;
  is_onboarded: boolean | null;
  is_admin: boolean | null;
  created_at: string;
};

type ReportRow = {
  id: string;
  reason: string | null;
  status: string | null;
  created_at: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [stats, setStats] = useState({
    profiles: 0,
    onboarded: 0,
    matches: 0,
    messages: 0,
    reports: 0,
    blocked: 0,
  });
  const [people, setPeople] = useState<ProfileRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [query, setQuery] = useState("");
  const [newCode, setNewCode] = useState("");
  const [codeNote, setCodeNote] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: me, error: meError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (meError) {
        setErrorMsg(meError.message);
        setLoading(false);
        return;
      }

      if (!me?.is_admin) {
        setDenied(true);
        setLoading(false);
        return;
      }

      const [profiles, onboarded, matches, messages, reportCount, blocked] =
        await Promise.all([
          safeCount("profiles"),
          safeCount("profiles", (q) => q.eq("is_onboarded", true)),
          safeCount("matches"),
          safeCount("messages"),
          safeCount("reports"),
          safeCount("blocks"),
        ]);

      setStats({
        profiles,
        onboarded,
        matches,
        messages,
        reports: reportCount,
        blocked,
      });

      const { data: latestPeople } = await supabase
        .from("profiles")
        .select("id, first_name, neighborhood, is_onboarded, is_admin, created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      setPeople((latestPeople as ProfileRow[]) || []);

      const { data: latestReports } = await supabase
        .from("reports")
        .select("id, reason, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      setReports((latestReports as ReportRow[]) || []);
      setLoading(false);
    };

    load();
  }, [router]);

  const createInvite = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) {
      setActionMsg("Type a code first.");
      return;
    }
    const { error } = await supabase.from("invite_codes").insert({
      code,
      max_uses: 25,
      used_count: 0,
      is_active: true,
      note: codeNote.trim() || "created from admin home",
    });
    if (error) {
      setActionMsg(error.message);
      return;
    }
    setNewCode("");
    setCodeNote("");
    setActionMsg(`Invite code ${code} is live.`);
  };

  const searchPeople = async () => {
    const q = query.trim();
    if (!q) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, neighborhood, is_onboarded, is_admin, created_at")
      .ilike("first_name", `%${q}%`)
      .limit(12);
    if (error) {
      setActionMsg(error.message);
      return;
    }
    setPeople((data as ProfileRow[]) || []);
    setActionMsg(`${data?.length || 0} people found.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading admin...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Admin is locked</h1>
        <p className="text-slate-400 text-sm mb-4">
          This account is not marked as admin. In Supabase run:
        </p>
        <pre className="text-left text-xs bg-slate-900 border border-slate-800 rounded-xl p-3 overflow-x-auto w-full max-w-md">
{`update public.profiles
set is_admin = true
where id = 'YOUR-USER-ID';`}
        </pre>
        <button
          onClick={() => router.push("/profile")}
          className="mt-4 bg-slate-800 px-6 py-3 rounded-xl text-sm"
          type="button"
        >
          Back to profile
        </button>
      </div>
    );
  }

  const cards = [
    { label: "Profiles", value: stats.profiles, href: "/admin/users" },
    { label: "Onboarded", value: stats.onboarded, href: "/admin/users" },
    { label: "Matches", value: stats.matches, href: "/matches" },
    { label: "Messages", value: stats.messages, href: "/messages" },
    { label: "Reports", value: stats.reports, href: "/admin/reports" },
    { label: "Blocks", value: stats.blocked, href: "/admin/reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Admin</h1>
        <p className="text-slate-500 text-sm mb-6">
          Windsor Connect command center
        </p>

        {errorMsg && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {errorMsg}
          </p>
        )}
        {actionMsg && (
          <p className="mb-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {actionMsg}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => router.push(c.href)}
              className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-rose-400"
            >
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-slate-500 mt-1">{c.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-rose-400" />
            Create invite code
          </p>
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="WINDSOR519"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 mb-2 uppercase"
          />
          <input
            value={codeNote}
            onChange={(e) => setCodeNote(e.target.value)}
            placeholder="Note (friends, testers)"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 mb-3"
          />
          <button
            type="button"
            onClick={createInvite}
            className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl"
          >
            Make code live
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-rose-400" />
            Find a person
          </p>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="First name"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3"
            />
            <button
              type="button"
              onClick={searchPeople}
              className="bg-slate-800 px-4 rounded-xl"
            >
              Search
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {people.map((p) => (
              <div key={p.id} className="text-sm border-t border-slate-800 pt-2">
                <p className="font-medium">
                  {p.first_name || "No name"}{" "}
                  {p.is_admin ? "· admin" : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {p.neighborhood || "no town"} ·{" "}
                  {p.is_onboarded ? "profile done" : "not finished"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4">
          <p className="font-semibold mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-400" />
            Latest reports
          </p>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports yet.</p>
          ) : (
            reports.map((r) => (
              <p key={r.id} className="text-sm text-slate-300 mb-2">
                {r.reason || "No reason"} · {r.status || "open"}
              </p>
            ))
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/admin/reports")}
            className="w-full bg-slate-900 border border-amber-500/30 text-amber-400 hover:bg-slate-800 rounded-xl py-3 text-sm"
            type="button"
          >
            Open reports queue
          </button>
          <button
            onClick={() => router.push("/admin/invites")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm flex items-center justify-center gap-2"
            type="button"
          >
            <Ticket className="w-4 h-4 text-rose-400" />
            All invite codes
          </button>
          <button
            onClick={() => router.push("/admin/users")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm flex items-center justify-center gap-2"
            type="button"
          >
            <Users className="w-4 h-4 text-rose-400" />
            Users
          </button>
        </div>
      </div>
    </div>
  );
}
