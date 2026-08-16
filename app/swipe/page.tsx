"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { supabase } from "../../lib/supabaseClient";
import { Heart, X, MapPin } from "lucide-react";
import MatchModal from "../components/MatchModal";

interface Profile {
  id: string;
  first_name: string;
  age: number | null;
  city: string;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  gender?: string | null;
}

export default function SwipePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [exitX, setExitX] = useState(0);

  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState("");

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
          .select("photo_urls")
          .eq("id", user.id)
          .single();

        setCurrentUserPhoto(myProfile?.photo_urls?.[0] || null);
        fetchProfiles(user.id);
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const fetchProfiles = async (currentUserId: string) => {
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("target_gender")
      .eq("id", currentUserId)
      .single();

    const { data: swiped } = await supabase
      .from("swipes")
      .select("target_id")
      .eq("swiper_id", currentUserId);

    const { data: blocked } = await supabase
      .from("blocks")
      .select("blocked_id")
      .eq("blocker_id", currentUserId);

    const swipedIds = (swiped ?? []).map((s) => s.target_id);
    const blockedIds = (blocked ?? []).map((b) => b.blocked_id);
    const excludeIds = [...new Set([...swipedIds, ...blockedIds])];

    let query = supabase
      .from("profiles")
      .select("*")
      .eq("is_onboarded", true)
      .neq("id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (myProfile?.target_gender && myProfile.target_gender !== "everyone") {
      query = query.eq("gender", myProfile.target_gender);
    }

    if (excludeIds.length > 0) {
      query = query.not("id", "in", `(${excludeIds.join(",")})`);
    }

    const { data } = await query;
    setProfiles(data ?? []);
    setLoading(false);
  };

  const handleSwipe = async (direction: "like" | "pass") => {
    if (!userId || currentIndex >= profiles.length) return;

    const target = profiles[currentIndex];
    setExitX(direction === "like" ? 500 : -500);

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action: direction,
    });

    if (direction === "like") {
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
          })
          .select("id")
          .single();

        if (newMatch) {
          setMatchedUser(target);
          setMatchId(newMatch.id);
          setShowMatch(true);
        }
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitX(0);
      x.set(0);
    }, 250);
  };

  const handleBlock = async () => {
    if (!userId || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];

    if (!confirm(`Block ${target.first_name}? They will no longer appear.`)) {
      return;
    }

    await supabase.from("blocks").insert({
      blocker_id: userId,
      blocked_id: target.id,
    });

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action: "pass",
    });

    setCurrentIndex((prev) => prev + 1);
  };

  const handleReport = async () => {
    if (!userId || currentIndex >= profiles.length) return;
    const target = profiles[currentIndex];

    const reason = prompt("Why are you reporting this user? (optional)");
    if (reason === null) return;

    await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: target.id,
      reason: reason || "No reason given",
    });

    alert("Report submitted. Thank you.");
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) handleSwipe("like");
    else if (info.offset.x < -100) handleSwipe("pass");
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading profiles...
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6 text-center">
        <Heart className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No more profiles right now</h2>
        <p className="text-slate-400 mt-3 max-w-xs">
          Check back later — new people join Windsor Connect every day.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 pb-24">
      <div className="w-full max-w-sm relative h-[70vh] max-h-[580px]">
        <AnimatePresence>
          <motion.div
            key={currentProfile.id}
            className="absolute inset-0 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 cursor-grab active:cursor-grabbing"
            style={{ x, rotate }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.9}
            onDragEnd={handleDragEnd}
            animate={{ x: exitX }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-6 border-4 border-emerald-500 text-emerald-500 font-extrabold text-3xl px-4 py-1 rounded-lg -rotate-12 z-20"
            >
              LIKE
            </motion.div>

            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-6 border-4 border-rose-500 text-rose-500 font-extrabold text-3xl px-4 py-1 rounded-lg rotate-12 z-20"
            >
              NOPE
            </motion.div>

            {currentProfile.photo_urls?.[0] ? (
              <img
                src={currentProfile.photo_urls[0]}
                alt={currentProfile.first_name}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <Heart className="w-16 h-16 text-slate-600" />
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-white">
                  {currentProfile.first_name}
                </h2>
                {currentProfile.age && (
                  <span className="text-2xl text-slate-300">
                    {currentProfile.age}
                  </span>
                )}
              </div>

              {currentProfile.neighborhood && (
                <div className="flex items-center gap-1 text-rose-400 text-sm mt-1">
                  <MapPin className="w-4 h-4" />
                  {currentProfile.neighborhood}
                </div>
              )}

              {currentProfile.bio && (
                <p className="text-slate-200 text-sm mt-2 line-clamp-2">
                  {currentProfile.bio}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Like / Pass buttons */}
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

      {/* Block & Report buttons */}
      <div className="flex justify-center gap-8 mt-5 text-sm">
        <button
          onClick={handleBlock}
          className="text-slate-500 hover:text-rose-400 transition-colors"
        >
          Block
        </button>
        <button
          onClick={handleReport}
          className="text-slate-500 hover:text-rose-400 transition-colors"
        >
          Report
        </button>
      </div>

      {matchedUser && (
        <MatchModal
          isOpen={showMatch}
          onClose={() => setShowMatch(false)}
          matchId={matchId}
          otherUser={matchedUser}
          currentUserPhoto={currentUserPhoto}
        />
      )}
    </div>
  );
}