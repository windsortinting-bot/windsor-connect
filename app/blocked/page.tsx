"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Ban } from "lucide-react";

interface BlockItem {
  blockId: string;
  otherId: string;
  firstName: string;
  photo: string | null;
}

export default function BlockedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BlockItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      const { data: blocks, error } = await supabase
        .from("blocks")
        .select("id, blocked_id")
        .eq("blocker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (!blocks || blocks.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const ids = blocks.map((b) => b.blocked_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, photo_urls")
        .in("id", ids);

      const map = new Map((profiles || []).map((p) => [p.id, p]));
      setItems(
        blocks.map((b) => {
          const p = map.get(b.blocked_id);
          return {
            blockId: b.id,
            otherId: b.blocked_id,
            firstName: p?.first_name || "User",
            photo: p?.photo_urls?.[0] || null,
          };
        })
      );
      setLoading(false);
    };
    load();
  }, [router]);

  const handleUnblock = async (blockId: string, name: string) => {
    if (!confirm(`Unblock ${name}?`)) return;
    const { error } = await supabase.from("blocks").delete().eq("id", blockId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.blockId !== blockId));
    setMessage(`${name} unblocked`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading blocked users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Blocked</h1>
        <p className="text-slate-500 text-sm mb-6">
          People you blocked won’t see you
        </p>

        {message && (
          <p className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Ban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No blocked users</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.blockId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                      ?
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.firstName}</p>
                </div>
                <button
                  onClick={() => handleUnblock(item.blockId, item.firstName)}
                  className="text-sm px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-rose-500/40 hover:text-rose-400"
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