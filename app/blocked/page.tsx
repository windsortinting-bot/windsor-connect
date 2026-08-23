"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { listBlockedProfiles, unblockUser } from "../../lib/blocks";
import EmptyState from "../components/EmptyState";
import { ArrowLeft } from "lucide-react";

export default function BlockedPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (uid: string) => {
    const list = await listBlockedProfiles(uid);
    setRows(list);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      await load(user.id);
    };
    init();
  }, [router]);

  const onUnblock = async (blockedId: string) => {
    if (!userId) return;
    await unblockUser(userId, blockedId);
    setRows((prev) => prev.filter((r) => r.id !== blockedId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Blocked</h1>

        {rows.length === 0 ? (
          <EmptyState
            title="No blocked users"
            body="People you block will appear here."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200">
                  {r.photo_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_urls[0]}
                      alt={r.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {r.first_name}
                    {r.age ? `, ${r.age}` : ""}
                  </p>
                  {r.neighborhood && (
                    <p className="text-xs text-slate-500">{r.neighborhood}</p>
                  )}
                </div>
                <button
                  onClick={() => onUnblock(r.id)}
                  className="text-sm text-rose-600"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}