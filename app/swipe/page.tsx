"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import {
  Heart,
  X,
  MapPin,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import MatchModal from "../components/MatchModal";

const DAILY_LIMIT = 8;
const SUPER_LIKE_LIMIT = 1;

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
  min_age_pref?: number | null;
  max_age_pref?: number | null;
  height?: string | null;
  kids_status?: string | null;
  kids_preference?: string | null;
  prompt_1?: string | null;
  prompt_1_answer?: string | null;
  prompt_2?: string | null;
  prompt_2_answer?: string | null;
  prompt_3?: string | null;
  prompt_3_answer?: string | null;
  is_banned?: boolean | null;
  is_paused?: boolean | null;
}

function kidsStatusLabel(status?: string | null) {
  if (status === "have_kids") return "Has kids";
  if (status === "no_kids") return "No kids";
  return null;
}

function kidsPrefLabel(pref?: string | null) {
  if (pref === "want") return "Wants kids";
  if (pref === "dont_want") return "Doesn't want kids";
  if (pref === "already_have") return "Already has kids";
  if (pref === "open") return "Open to kids";
  return null;
}

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState("");
  const [swipesLeft, setSwipesLeft] = useState(DAILY_LIMIT);
  const [limitReached, setLimitReached] = useState(false);
  const [iAmPaused, setIAmPaused] = useState(false);
  const [lastPassed, setLastPassed] = useState<Profile | null>(null);
  const [canSecondLook, setCanSecondLook] = useState(false);
  const [superLikesLeft, setSuperLikesLeft] = useState(SUPER_LIKE_LIMIT);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", user.id);

      await supabase.rpc("reset_daily_swipes_if_needed", {
        p_user_id: user.id,
      });

      // Reset super likes daily
      const { data: myProfile } = await supabase
        .from("profiles")
        .select(
          "photo_urls, daily_swipes_used, age, min_age_pref, max_age_pref, target_gender, is_paused, is_banned, super_likes_used, super_likes_reset_at"
        )
        .eq("id", user.id)
        .single();

      if (myProfile?.is_banned) {
        setLoading(false);
        return;
      }

      // Daily super like reset
      const resetAt = myProfile?.super_likes_reset_at
        ? new Date(myProfile.super_likes_reset_at)
        : null;
      const now = new Date();
      let superUsed = myProfile?.super_likes_used ?? 0;
      if (
        !resetAt ||
        resetAt.toDateString() !== now.toDateString()
      ) {
        superUsed = 0;
        await supabase
          .from("profiles")
          .update({
            super_likes_used: 0,
            super_likes_reset_at: now.toISOString(),
          })
          .eq("id", user.id);
      }
      setSuperLikesLeft(Math.max(0, SUPER_LIKE_LIMIT - superUsed));

      setCurrentUserPhoto(myProfile?.photo_urls?.[0] || null);
      setIAmPaused(myProfile?.is_paused ?? false);

      const used = myProfile?.daily_swipes_used ?? 0;
      const left = Math.max(0, DAILY_LIMIT - used);
      setSwipesLeft(left);

      if (myProfile?.is_paused) {
        setLoading(false);
        return;
      }

      if (left <= 0) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      await fetchProfiles(user.id, left, myProfile);
    };

    getUser();
  }, []);

  const fetchProfiles = async (
    currentUserId: string,
    maxToShow: number,
    myProfile: any
  ) => {
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

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("is_onboarded", true)
      .order("created_at", { ascending: false })
      .limit(40);

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    if (myProfile?.target_gender && myProfile.target_gender !== "everyone") {
      query = query.eq("gender", myProfile.target_gender);
    }

    if (myProfile?.min_age_pref) {
      query = query.gte("age", myProfile.min_age_pref);
    }
    if (myProfile?.max_age_pref) {
      query = query.lte("age", myProfile.max_age_pref);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch profiles error:", error);
      setProfiles([]);
    } else {
      let filtered = (data ?? []).filter((p) => !p.is_banned && !p.is_paused);
      if (myProfile?.age) {
        filtered = filtered.filter((p) => {
          const min = p.min_age_pref ?? 18;
          const max = p.max_age_pref ?? 99;
          return myProfile.age >= min && myProfile.age <= max;
        });
      }
      setProfiles(filtered.slice(0, maxToShow));
    }

    setCurrentIndex(0);
    setPhotoIndex(0);
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
    if (left <= 0) setLimitReached(true);
  };

  const handleSwipe = async (
    action: "like" | "pass",
    isSuperLike = false
  ) => {
    if (!userId || currentIndex >= profiles.length || limitReached) return;
    if (isSuperLike && superLikesLeft <= 0) return;

    const target = profiles[currentIndex];

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action,
      is_super_like: isSuperLike,
    });

    if (isSuperLike) {
      const { data } = await supabase
        .from("profiles")
        .select("super_likes_used")
        .eq("id", userId)
        .single();
      const used = (data?.super_likes_used ?? 0) + 1;
      await supabase
        .from("profiles")
        .update({ super_likes_used: used })
        .eq("id", userId);
      setSuperLikesLeft(Math.max(0, SUPER_LIKE_LIMIT - used));
    }

    if (action === "pass") {
      setLastPassed(target);
      setCanSecondLook(true);
      await supabase
        .from("profiles")
        .update({ last_passed_id: target.id })
        .eq("id", userId);
    } else {
      setCanSecondLook(false);
      setLastPassed(null);
    }

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
            ).toISOString(),
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
    setPhotoIndex(0);
    x.set(0);
  };

  const handleSecondLook = async () => {
    if (!userId || !lastPassed || !canSecondLook) return;

    await supabase
      .from("swipes")
      .delete()
      .eq("swiper_id", userId)
      .eq("target_id", lastPassed.id)
      .eq("action", "pass");

    setProfiles((prev) => {
      const copy = [...prev];
      copy.splice(currentIndex, 0, lastPassed);
      return copy;
    });

    const { data } = await supabase
      .from("profiles")
      .select("daily_swipes_used")
      .eq("id", userId)
      .single();

    const used = Math.max(0, (data?.daily_swipes_used ?? 1) - 1);
    await supabase
      .from("profiles")
      .update({ daily_swipes_used: used, last_passed_id: null })
      .eq("id", userId);

    setSwipesLeft((prev) => Math.min(DAILY_LIMIT, prev + 1));
    setLimitReached(false);
    setCanSecondLook(false);
    setLastPassed(null);
    setPhotoIndex(0);
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
    setCanSecondLook(false);
    setLastPassed(null);
    await incrementDailySwipe();
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
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

    await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: target.id,
      reason: reasons[reason] || "Other",
    });

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action: "pass",
    });

    setCanSecondLook(false);
    setLastPassed(null);
    await incrementDailySwipe();
    alert("Thanks for the report. We’ll review it.");
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
    x.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profiles...
      </div>
    );
  }

  if (iAmPaused) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <Clock className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold">Your profile is paused</h2>
        <p className="text-slate-400 mt-3 max-w-xs">
          You’re hidden from discovery. Unpause in Settings to start swiping
          again.
        </p>
        <button
          onClick={() => (window.location.href = "/settings")}
          className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
        >
          Open Settings
        </button>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <Clock className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">That’s your daily batch</h2>
        <p className="text-slate-400 mt-3 max-w-xs">
          You get {DAILY_LIMIT} people per day. Come back tomorrow for a fresh
          set.
        </p>
        {canSecondLook && lastPassed && (
          <button
            onClick={handleSecondLook}
            className="mt-6 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Second look at {lastPassed.first_name}
          </button>
        )}
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
          You’ve seen everyone available today.
        </p>
        {canSecondLook && lastPassed && (
          <button
            onClick={handleSecondLook}
            className="mt-6 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Second look at {lastPassed.first_name}
          </button>
        )}
      </div>
    );
  }

  const photos =
    currentProfile.photo_urls && currentProfile.photo_urls.length > 0
      ? currentProfile.photo_urls
      : [];

  const statusLabel = kidsStatusLabel(currentProfile.kids_status);
  const prefLabel = kidsPrefLabel(currentProfile.kids_preference);

  const prompts = [
    currentProfile.prompt_1_answer
      ? { q: currentProfile.prompt_1, a: currentProfile.prompt_1_answer }
      : null,
    currentProfile.prompt_2_answer
      ? { q: currentProfile.prompt_2, a: currentProfile.prompt_2_answer }
      : null,
    currentProfile.prompt_3_answer
      ? { q: currentProfile.prompt_3, a: currentProfile.prompt_3_answer }
      : null,
  ].filter(Boolean) as { q: string | null | undefined; a: string }[];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 pb-28">
      <div className="w-full max-w-sm mb-4 flex justify-between items-center text-sm text-slate-400">
        <span>Today’s batch</span>
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-medium flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {superLikesLeft}
          </span>
          <span className="text-rose-400 font-medium">{swipesLeft} left</span>
        </div>
      </div>

      <div className="w-full max-w-sm relative">
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) handleSwipe("like");
              else if (info.offset.x < -100) handleSwipe("pass");
              else x.set(0);
            }}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 z-20 border-4 border-emerald-400 text-emerald-400 font-bold text-2xl px-4 py-1 rounded-lg rotate-[-20deg] pointer-events-none"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-6 right-6 z-20 border-4 border-rose-500 text-rose-500 font-bold text-2xl px-4 py-1 rounded-lg rotate-[20deg] pointer-events-none"
            >
              NOPE
            </motion.div>

            <div className="relative w-full h-80 bg-slate-800 select-none">
              {photos.length > 0 ? (
                <img
                  src={photos[photoIndex]}
                  alt={currentProfile.first_name}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                  <Heart className="w-12 h-12 text-slate-600" />
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                    {photos.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all ${
                          i === photoIndex ? "w-6 bg-white" : "w-4 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((p) => Math.max(0, p - 1));
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex((p) =>
                        Math.min(photos.length - 1, p + 1)
                      );
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {currentProfile.first_name}
                </h2>
                {currentProfile.age && (
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-300">
                    {currentProfile.age}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {currentProfile.height && (
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                    {currentProfile.height}
                  </span>
                )}
                {statusLabel && (
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                    {statusLabel}
                  </span>
                )}
                {prefLabel && (
                  <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                    {prefLabel}
                  </span>
                )}
              </div>

              {currentProfile.neighborhood && (
                <div className="flex items-center gap-1 text-rose-400 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  {currentProfile.neighborhood}
                </div>
              )}

              {currentProfile.bio && (
                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                  {currentProfile.bio}
                </p>
              )}

              {prompts.length > 0 && (
                <div className="space-y-2 mt-2">
                  {prompts.slice(0, 2).map((p, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/60 rounded-xl px-3 py-2.5"
                    >
                      <p className="text-[11px] text-slate-500 mb-0.5">{p.q}</p>
                      <p className="text-sm text-slate-200">{p.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center items-center gap-5 mt-8">
        <button
          onClick={() => handleSwipe("pass")}
          className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
        >
          <X className="w-7 h-7 text-slate-400" />
        </button>

        {canSecondLook && (
          <button
            onClick={handleSecondLook}
            title="Second Look"
            className="w-11 h-11 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:border-amber-500/50 text-slate-400 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSwipe("like", true)}
          disabled={superLikesLeft <= 0}
          title="Super Like"
          className="w-12 h-12 rounded-full bg-slate-900 border border-amber-500/40 flex items-center justify-center hover:bg-amber-500/20 disabled:opacity-40 active:scale-95 transition-all"
        >
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        </button>

        <button
          onClick={() => handleSwipe("like")}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
        >
          <Heart className="w-7 h-7 text-white fill-white" />
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