"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, X, MapPin } from "lucide-react";
import MatchModal from "../components/MatchModal";

interface Profile {
  id: string;
  first_name: string;
  age: number | null;
  gender: string | null;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
}

export default function LikesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState("");

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

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("photo_urls")
        .eq("id", user.id)
        .single();

      setCurrentUserPhoto(myProfile?.photo_urls?.[0] || null);
      await fetchIncomingLikes(user.id);
    };

    init();
  }, [router]);

  const fetchIncomingLikes = async (currentUserId: string) => {
    setLoading(true);

    // People who liked you
    const { data: incoming, error: incomingError } = await supabase
      .from("swipes")
      .select("swiper_id")
      .eq("target_id", currentUserId)
      .eq("action", "like");

    if (incomingError) {
      console.error("Incoming likes error:", incomingError);
      setLoading(false);
      return;
    }

    const likedYouIds = (incoming ?? []).map((s) => s.swiper_id);

    if (likedYouIds.length === 0) {
      setProfiles([]);
      setCurrentIndex(0);
      setLoading(false);
      return;
    }

    // People you already swiped on
    const { data: yourSwipes } = await supabase
      .from("swipes")
      .select("target_id")
      .eq("swiper_id", currentUserId);

    const alreadySwipedIds = (yourSwipes ?? []).map((s) => s.target_id);

    // Only show people who liked you that you haven't responded to yet
    const pendingIds = likedYouIds.filter(
      (id) => !alreadySwipedIds.includes(id)
    );

    if (pendingIds.length === 0) {
      setProfiles([]);
      setCurrentIndex(0);
      setLoading(false);
      return;
    }

    const { data: pendingProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", pendingIds)
      .eq("is_onboarded", true);

    if (profileError) {
      console.error("Profiles error:", profileError);
      setLoading(false);
      return;
    }

    setProfiles(pendingProfiles ?? []);
    setCurrentIndex(0);
    setLoading(false);
  };

  const handleSwipeAction = async (action: "like" | "pass") => {
    if (!userId || currentIndex >= profiles.length) return;

    const target = profiles[currentIndex];

    // Save the swipe
    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action,
    });

    // If you like them back → create match
    if (action === "like") {
      const { data: newMatch, error: matchError } = await supabase
        .from("matches")
        .insert({
          user1_id: userId < target.id ? userId : target.id,
          user2_id: userId < target.id ? target.id : userId,
        })
        .select("id")
        .single();

      if (newMatch) {
        setMatchedUser(target);
        setMatchId(newMatch.id);
        setShowMatch(true);
      } else if (matchError) {
        // Match might already exist — still try to show the popup
        const { data: existing } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1_id.eq.${userId},user2_id.eq.${target.id}),and(user1_id.eq.${target.id},user2_id.eq.${userId})`
          )
          .maybeSingle();

        if (existing) {
          setMatchedUser(target);
          setMatchId(existing.id);
          setShowMatch(true);
        }
      }
    }

    // Move to next person
    setCurrentIndex((prev) => prev + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading likes...
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  // Empty state
  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-24">
        <Heart className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No pending likes</h2>
        <p className="text-slate-400 mt-2 max-w-xs">
          When someone likes you and you haven’t responded yet, they’ll show up
          here.
        </p>
        <button
          onClick={() => router.push("/swipe")}
          className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm font-medium"
        >
          Go to Swipe
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 pb-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Likes You
        </h1>
        <p className="text-slate-400 text-sm text-center mb-6">
          {currentIndex + 1} of {profiles.length}
        </p>

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {currentProfile.photo_urls?.[0] ? (
            <img
              src={currentProfile.photo_urls[0]}
              alt={currentProfile.first_name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-slate-800 flex items-center justify-center">
              <Heart className="w-12 h-12 text-slate-600" />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl font-bold text-white">
                {currentProfile.first_name}
              </h2>
              {currentProfile.age && (
                <span className="bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-300">
                  {currentProfile.age}
                </span>
              )}
            </div>

            {currentProfile.neighborhood && (
              <div className="flex items-center gap-1 text-rose-400 text-sm mb-4">
                <MapPin className="w-4 h-4" />
                {currentProfile.neighborhood}
              </div>
            )}

            {currentProfile.bio && (
              <p className="text-slate-300 leading-relaxed">
                {currentProfile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Like / Pass buttons */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipeAction("pass")}
            className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
          >
            <X className="w-8 h-8 text-slate-400" />
          </button>
          <button
            onClick={() => handleSwipeAction("like")}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </button>
        </div>
      </div>

      {/* Match popup */}
      {matchedUser && (
        <MatchModal
          isOpen={showMatch}
          onClose={() => {
            setShowMatch(false);
            setMatchedUser(null);
          }}
          matchId={matchId}
          otherUser={matchedUser}
          currentUserPhoto={currentUserPhoto}
        />
      )}
    </div>
  );
}