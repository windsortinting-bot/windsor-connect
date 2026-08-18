"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  Heart,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import MatchModal from "../components/MatchModal";

interface Profile {
  id: string;
  first_name: string;
  age: number | null;
  neighborhood: string | null;
  bio: string | null;
  photo_urls: string[] | null;
  height?: string | null;
  kids_status?: string | null;
  kids_preference?: string | null;
  prompt_1?: string | null;
  prompt_1_answer?: string | null;
  prompt_2?: string | null;
  prompt_2_answer?: string | null;
  prompt_3?: string | null;
  prompt_3_answer?: string | null;
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

export default function LikesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Profile | null>(null);
  const [matchId, setMatchId] = useState("");

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

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

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("photo_urls")
        .eq("id", user.id)
        .single();

      setCurrentUserPhoto(myProfile?.photo_urls?.[0] || null);

      // People who liked me
      const { data: incoming } = await supabase
        .from("swipes")
        .select("swiper_id")
        .eq("target_id", user.id)
        .eq("action", "like");

      const likerIds = (incoming ?? []).map((s) => s.swiper_id);
      if (likerIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Already swiped by me
      const { data: mySwipes } = await supabase
        .from("swipes")
        .select("target_id")
        .eq("swiper_id", user.id);

      const already = new Set((mySwipes ?? []).map((s) => s.target_id));
      const pendingIds = likerIds.filter((id) => !already.has(id));

      if (pendingIds.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      const { data: people } = await supabase
        .from("profiles")
        .select("*")
        .in("id", pendingIds)
        .eq("is_onboarded", true);

      const clean = (people ?? []).filter((p) => !p.is_banned && !p.is_paused);
      setProfiles(clean);
      setCurrentIndex(0);
      setPhotoIndex(0);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleSwipeAction = async (action: "like" | "pass") => {
    if (!userId || currentIndex >= profiles.length) return;

    const target = profiles[currentIndex];

    await supabase.from("swipes").insert({
      swiper_id: userId,
      target_id: target.id,
      action,
    });

    if (action === "like") {
      // They already liked you → create match
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

    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
    x.set(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading likes...
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4 text-center pb-28">
        <Heart className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">No pending likes</h2>
        <p className="text-slate-400 mt-2 max-w-xs">
          When someone likes you, they’ll show up here so you can decide.
        </p>
        <button
          onClick={() => router.push("/swipe")}
          className="mt-6 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
        >
          Go to Swipe
        </button>
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
      <div className="w-full max-w-sm mb-4">
        <h1 className="text-2xl font-bold text-white text-center">Likes</h1>
        <p className="text-slate-500 text-sm text-center mt-1">
          {profiles.length - currentIndex} waiting for you
        </p>
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
              if (info.offset.x > 100) handleSwipeAction("like");
              else if (info.offset.x < -100) handleSwipeAction("pass");
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

      <div className="flex justify-center items-center gap-8 mt-8">
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