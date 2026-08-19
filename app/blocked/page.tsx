"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, Ban, Heart } from "lucide-react";

interface BlockedUser {
  blockId: string;
  otherId: string;
  firstName: string;
  age: number | null;
  photo: string | null;
  createdAt: string | null;
}

export default function BlockedPage() {
  const router = useRouter();
  const [items, setItems] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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
        .select("id, blocked_id, created_at")
        .eq("blocker_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
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
        .select("id, first_name, age, photo_urls")
        .in("id", ids);

      const map = new Map((profiles ?? []).map((p) => [p.id, p]));

      const list: BlockedUser[] = [];
      for (const b of blocks) {
        const p = map.get(b.blocked_id);
        list.push({
          blockId: b.id,
          otherId: b.blocked_id,
          firstName: p?.first_name || "User",
          age: p?.age ?? null,
          photo: p?.photo_urls?.[0] || null,
          createdAt: b.created_at || null,
        });
      }

      setItems(list);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleUnblock = async (blockId: string, name: string) => {
    if (!userId) return;
    if (!confirm(`Unblock ${name}? They may appear in discovery again.`)) return;

    const { error } = await supabase.from("blocks").delete().eq("id", blockId);

    if (error) {
      alert(error.message);
      return;
    }

    setItems((prev) => prev.filter((i) => i.blockId !== blockId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading blocked list...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to settings
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ban className="w-6 h-6 text-rose-400" />
          <h1 className="text-3xl font-bold">Blocked</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">
          People you’ve blocked won’t see you or message you.
        </p>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <Ban className="w-14 h-14 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">No blocked users</p>
            <p className="text-slate-500 text-sm mt-2">
              When you block someone, they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.blockId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={item.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">
                    {item.firstName}
                    {item.age ? `, ${item.age}` : ""}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Blocked</p>
                </div>

                <button
                  onClick={() => handleUnblock(item.blockId, item.firstName)}
                  className="text-sm px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
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