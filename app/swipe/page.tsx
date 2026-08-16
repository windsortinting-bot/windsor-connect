"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { Heart, X, MapPin, Clock } from "lucide-react";
import MatchModal from "../components/MatchModal";

const DAILY_LIMIT = 8;

interface Profile {
  id: string;
  first_name: string;
  age: number | null;
  gender: string | null;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  target_gender?: string | null;
}

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState("");
  const [swipesLeft, setSwipesLeft] = useState(DAILY_LIMIT);
  const [limitReached, setLimitReached] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        const { data: myProfile } = await supabase
          .from("profiles")
          .select("photo_urls, daily_swipes_used, daily_swipes_reset_at")
          .eq("id", user.id)
          .single();

        setCurrentUserPhoto(myProfile?.photo_urls?.[0] || null);

        // Reset daily count if needed
        await supabase.rpc("reset_daily_swipes_if_needed", {
          p_user_id: user.id,
        });

        // Re-fetch after possible reset
        const { data: refreshed } = await supabase
          .from("profiles")
          .select("daily_swipes_used")
          .eq("id", user.id)
          .single();

        const used = refreshed?.daily_swipes_used ?? 0;
        const left = Math.max(0, DAILY_LIMIT - used);
        setSwipesLeft(left);

        if (left <= 0) {
          setLimitReached(true);
          setLoading(false);
          return;
        }

        await fetchProfiles(user.id, left);
      }
    };

    getUser();
  }, []);

  const fetchProfiles = async (currentUserId: string, maxToShow: number) => {
    setLoading(true);

    const { data: swiped } = await supabase
      .from("swipes")
      .select("target_id")
      .eq("swiper_id", currentUserId);

    const swipedIds = (swiped ?? []).map((s) => s.target_id);

    const { data: blocked } = await supabase
      .from("blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);

    const blockedIds = (blocked ?? []).map((b) =>
      b.blocker_id === currentUserId ? b.blocked_id : b.blocker_id
    );

    const excludeIds = [
      ...new Set([...swipedIds, ...blockedIds, currentUserId]),
    ];

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("target_gender")
      .eq("id", currentUserId)
      .single();

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("is_onboarded", true)
      .order("created_at", { ascending: false })
      .limit(maxToShow);

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    if (myProfile?.target_gender && myProfile.target_gender !== "everyone") {
      query = query.eq("gender", myProfile.target_gender);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch profiles error:", error);
    } else {
      setProfiles(data ?? []);
    }

    setCurrentIndex(0);
    setLoading(false);
  };

  const incrementDailySwipe = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select("daily_swipes_used")
      .eq("id", userId)
      .single();

    const newUsed = (data?.daily_swipes_used ?? 0) + 1;

    await supabase
      .from("profiles")
      .update({ daily_swipes_used: newUsed })
      .eq("id", userId);

    const left = Math.max(0, DAILY_LIMIT - newUsed);
    setSwipesLeft(left);

    if (left <= 0) {
      setLimitReached(true);
    }
  };

  const handleSwipe = async (action: "like" | "pass") => {
    if (!userId || currentIndex >= profiles.length || limitReached) return;

    const target = profiles[currentIndex];

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action,
    });

    await incrementDailySwipe();

    if (action === "like") {
      const { data: mutual } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", target.id)
        .eq("target_id", userId)
        .eq("action", "like")
        .maybeSingle();

      if (mutual) {
        const { data: newMatch } = await supabase
          .from("matches")
          .insert({
            user1_id: userId < target.id ? userId : target.id,
            user2_id: userId < target.id ? target.id : userId,
            expires_at: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000
            ).toISOString(), // 5 days if no messages
          })
          .select("id")
          .single();

        let finalMatchId = newMatch?.id || "";

        if (!newMatch) {
          const { data: existing } = await supabase
            .from("matches")
            .select("id")
            .or(
              `and(user1_id.eq.${userId},user2_id.eq.${target.id}),and(user1_id.eq.${target.id},user2_id.eq.${userId})`
            )
            .maybeSingle();

          if (existing) finalMatchId = existing.id;
        }

        setMatchedUser(target);
        setMatchId(finalMatchId || "temp");
        setShowMatch(true);
      }
    }

    setCurrentIndex((prev) => prev + 1);
    x.set(0);
  };

  const handleBlock = async () => {
    if (!userId || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];

    if (!confirm(`Block ${target.first_name}?`)) return;

    await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: target.id,
    });

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action: "pass",
    });

    await incrementDailySwipe();
    setCurrentIndex((prev) => prev + 1);
    x.set(0);
  };

  const handleReport = async () => {
    if (!userId || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];

    const reason = prompt(
      "Why are you reporting this profile?\n\n1 - Inappropriate photos\n2 - Fake profile\n3 - Harassment\n4 - Other\n\nType 1, 2, 3 or 4:"
    );

    if (!reason) return;

    const reasons: Record<string, string> = {
      "1": "Inappropriate photos",
      "2": "Fake profile",
      "3": "Harassment",
      "4": "Other",
    };

    const finalReason = reasons[reason] || "Other";

    await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: target.id,
      reason: finalReason,
    });

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action: "pass",
    });

    await incrementDailySwipe();
    alert("Thanks for the report. We’ll review it.");
    setCurrentIndex((prev) => prev + 1);
    x.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profiles...
      </div>
    );
  }

  // Daily limit reached
  if (limitReached) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <Clock className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">That’s your daily batch</h2>
        <p className="text-slate-400 mt-3 max-w-xs">
          You get {DAILY_LIMIT} carefully chosen people per day. Come back
          tomorrow for a fresh set.
        </p>
        <p className="text-slate-500 text-sm mt-6">
          Tip: Check your <span className="text-rose-400">Likes</span> — someone
          may already like you.
        </p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <Heart className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No more profiles right now</h2>
        <p className="text-slate-400 mt-2 max-w-xs">
          You’ve seen everyone available today. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 pb-28">
      {/* Daily remaining counter */}
      <div className="w-full max-w-sm mb-4 flex justify-between items-center text-sm text-slate-400">
        <span>Today’s batch</span>
        <span className="text-rose-400 font-medium">
          {swipesLeft} left
        </span>
      </div>

      <div className="w-full max-w-sm relative">
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                handleSwipe("like");
              } else if (info.offset.x < -100) {
                handleSwipe("pass");
              } else {
                x.set(0);
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
          >
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-10 border-4 border-emerald-400 text-emerald-400 font-bold text-2xl px-4 py-1 rounded-lg rotate-[-20deg]"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-6 right-6 z-10 border-4 border-rose-500 text-rose-500 font-bold text-2xl px-4 py-1 rounded-lg rotate-[20deg]"
            >
              NOPE
            </motion.div>

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
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-8 mt-8">
        <button
          onClick={() => handleSwipe("pass")}
          className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
        >
          <X className="w-8 h-8 text-slate-400" />
        </button>
        <button
          onClick={() => handleSwipe("like")}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
        >
          <Heart className="w-8 h-8 text-white fill-white" />
        </button>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={handleBlock}
          className="px-5 py-2.5 rounded-full border border-slate-700 bg-slate-900 text-slate-400 text-sm hover:border-rose-500/50 hover:text-rose-400 transition-all"
        >
          Block
        </button>
        <button
          onClick={handleReport}
          className="px-5 py-2.5 rounded-full border border-slate-700 bg-slate-900 text-slate-400 text-sm hover:border-rose-500/50 hover:text-rose-400 transition-all"
        >
          Report
        </button>
      </div>

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