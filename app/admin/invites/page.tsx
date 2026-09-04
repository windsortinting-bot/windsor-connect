"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { requireAdmin } from "../../../lib/adminUsers";
import { ArrowLeft } from "lucide-react";

type Code = {
  id: string;
  code: string;
  max_uses: number | null;
  uses: number | null;
  is_active: boolean | null;
  note: string | null;
};

export default function AdminInvitesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Code[]>([]);
  const [code, setCode] = useState("");
  const [maxUses, setMaxUses] = useState("25");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      await requireAdmin();
    } catch {
      setDenied(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invite_codes")
      .select("id, code, max_uses, is_active, note")
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setRows((data as Code[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!code.trim()) return;
    const { error } = await supabase.from("invite_codes").insert({
      code: code.trim().toUpperCase(),
      max_uses: Number(maxUses) || 25,
      used_count: 0,
      is_active: true,
      note: note.trim() || null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setCode("");
    setNote("");
    await load();
  };

  const toggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("invite_codes")
      .update({ is_active: !isActive })
      .eq("id", id);
    if (error) setMessage(error.message);
    else await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading invites...
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
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-6">Invite codes</h1>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="NEWCODE"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 uppercase"
          />
          <input
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Max uses"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
          />
          <button
            type="button"
            onClick={create}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Create code
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-mono font-semibold">{r.code}</p>
              <p className="text-xs text-slate-500 mt-1">
                {r.uses || 0}/{r.max_uses || 0} uses · {r.is_active ? "Active" : "Off"}
              </p>
              {r.note && <p className="text-sm text-slate-600 mt-2">{r.note}</p>}
              <button
                type="button"
                onClick={() => toggle(r.id, !!r.is_active)}
                className="mt-3 text-xs border border-slate-200 rounded-lg px-3 py-1.5"
              >
                {r.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}