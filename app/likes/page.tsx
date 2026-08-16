"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart } from "lucide-react";

export default function LikesPage() {
  const router = useRouter();
  const [likes, setLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLikes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // People who liked you
      const { data: incoming } = await supabase
        .from("swipes")
        .select("swiper_id, created_at")
        .eq("target_id", user.id)
        .eq("action", "like")
        .order("created_at", { ascending: false });

      if (!incoming || incoming.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      // Exclude people you already swiped on
      const { data: mySwipes } = await supabase
        .from("swipes")
        .select("target_id")
        .eq("swiper_id", user.id);

      const alreadySwiped = new Set((mySwipes ?? []).map((s) => s.target_id));

      const pendingIds = incoming
        .map((s) => s.swiper_id)
        .filter((id) => !alreadySwiped.has(id));

      if (pendingIds.length === 0) {
        setLikes([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", pendingIds);

      setLikes(profiles ?? []);
      setLoading(false);
    };

    loadLikes();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Likes You</h1>
        <p className="text-slate-400 text-sm mb-8">
          People who liked you — swipe right to match
        </p>

        {likes.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg font-medium">No likes yet</p>
            <p className="text-slate-500 text-sm mt-2">
              When someone likes you, they’ll show up here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likes.map((person) => (
              <button
                key={person.id}
                onClick={() => router.push("/swipe")}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-left"
              >
                <div className="aspect-[3/4] bg-slate-800 relative">
                  {person.photo_urls?.[0] ? (
                    <img
                      src={person.photo_urls[0]}
                      alt={person.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-semibold text-white">
                      {person.first_name}
                      {person.age ? `, ${person.age}` : ""}
                    </p>
                    <p className="text-xs text-slate-300">
                      {person.neighborhood || "Windsor"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}