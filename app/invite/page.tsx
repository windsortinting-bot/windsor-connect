"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Copy, Check } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const [codes, setCodes] = useState<{ code: string; uses: number; max_uses: number }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
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

      const { data } = await supabase
        .from("invite_codes")
        .select("code, uses, max_uses")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      setCodes((data as any) || []);
      setLoading(false);
    };
    load();
  }, [router]);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading invites...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Invite friends</h1>
        <p className="text-slate-500 text-sm mb-8">
          Soft-launch codes for Windsor testers
        </p>

        <div className="space-y-3">
          {codes.map((c) => (
            <div
              key={c.code}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-mono font-semibold tracking-wide">{c.code}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {c.uses}/{c.max_uses} uses
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(c.code)}
                className="flex items-center gap-1 text-sm text-rose-600"
              >
                {copied === c.code ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {codes.length === 0 && (
          <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-2xl p-4">
            No active invite codes yet.
          </p>
        )}
      </div>
    </div>
  );
}