"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, Plus, Ban, Check } from "lucide-react";

interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminInvitesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [maxUses, setMaxUses] = useState(50);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      .from("invite_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setCodes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("invite_codes").insert({
      code,
      max_uses: maxUses,
      used_count: 0,
      is_active: true,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setNewCode("");
      setMaxUses(50);
      setMessage("Code created");
      await load();
    }
    setSaving(false);
  };

  const toggleActive = async (row: InviteCode) => {
    const { error } = await supabase
      .from("invite_codes")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);

    if (error) {
      setMessage(error.message);
      return;
    }
    setCodes((prev) =>
      prev.map((c) =>
        c.id === row.id ? { ...c, is_active: !c.is_active } : c
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
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

        <h1 className="text-3xl font-bold mb-2">Invite codes</h1>
        <p className="text-slate-500 text-sm mb-6">
          Soft-launch access control
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3"
        >
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="NEW CODE"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 tracking-wider outline-none focus:border-rose-500"
          />
          <input
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create code
          </button>
        </form>

        <div className="space-y-3">
          {codes.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-white">{c.code}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {c.used_count}/{c.max_uses} used ·{" "}
                  {c.is_active ? "active" : "disabled"}
                </p>
              </div>
              <button
                onClick={() => toggleActive(c)}
                className={`px-3 py-2 rounded-xl text-sm border ${
                  c.is_active
                    ? "border-rose-500/40 text-rose-400"
                    : "border-emerald-500/40 text-emerald-400"
                }`}
              >
                {c.is_active ? (
                  <span className="flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" /> Disable
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Enable
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}