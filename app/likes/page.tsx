"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  fetchIncomingLikes,
  type DiscoverProfile,
} from "../../lib/discovery";
import {
  recordSwipe,
  createMatchSafe,
} from "../../lib/matching";
import MatchModal from "../components/MatchModal";
import EmptyState from "../components/EmptyState";
import { Heart, X, MapPin } from "lucide-react";

export default function LikesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverProfile | null>(null);
  const [matchId, setMatchId] = useState("");
  const [myPhoto, setMyPhoto] = useState<string | null>(null);

  const load = async (uid: string) => {
    const list = await fetchIncomingLikes(uid);
    setProfiles(list);
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

      const { data: me } = await supabase
        .from("profiles")
        .select("photo_urls, is_onboarded")
        .eq("id", user.id)
        .single();

      if (!me?.is_onboarded) {
        router.push("/onboarding");
        return;
      }

      setMyPhoto(me?.photo_urls?.[0] || null);
      await load(user.id);
    };
    init();
  }, [router]);

  const respond = async (profile: DiscoverProfile, action: "like" | "pass") => {
    if (!userId || busyId) return;
    setBusyId(profile.id);

    try {
      await recordSwipe(userId, profile.id, action);

      if (action === "like") {
        // They already liked you → always create match
        const mid = await createMatchSafe(userId, profile.id);
        if (mid) {
          setMatchId(mid);
          setMatchedUser(profile);
          setShowMatch(true);
        }
      }

      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    } catch (err) {
      console.error(err);
    }

    setBusyId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading likes...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">Likes you</h1>
        <p className="text-sm text-slate-500 mb-6">
          {profiles.length} waiting for your response
        </p>

        {profiles.length === 0 ? (
          <EmptyState
            title="No likes yet"
            body="When someone likes you, they’ll show up here."
            actionLabel="Go swipe"
            onAction={() => router.push("/swipe")}
          />
        ) : (
          <div className="space-y-4">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="h-56 bg-slate-200">
                  {p.photo_urls?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photo_urls[0]}
                      alt={p.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-lg">
                    {p.first_name}
                    {p.age ? `, ${p.age}` : ""}
                  </p>
                  {p.neighborhood && (
                    <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {p.neighborhood}
                    </p>
                  )}
                  {p.bio && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                      {p.bio}
                    </p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      disabled={busyId === p.id}
                      onClick={() => respond(p, "pass")}
                      className="flex-1 border border-slate-200 rounded-xl py-3 flex items-center justify-center gap-2 text-slate-600"
                    >
                      <X className="w-5 h-5" />
                      Pass
                    </button>
                    <button
                      disabled={busyId === p.id}
                      onClick={() => respond(p, "like")}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                      Like
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {matchedUser && (
          <MatchModal
            isOpen={showMatch}
            onClose={() => setShowMatch(false)}
            matchId={matchId}
            otherUser={matchedUser}
            currentUserPhoto={myPhoto}
          />
        )}
      </div>
    </div>
  );
}