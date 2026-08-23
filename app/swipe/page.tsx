"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  fetchDiscoverProfiles,
  type DiscoverProfile,
} from "../../lib/discovery";
import {
  recordSwipe,
  checkMutualLike,
  createMatchSafe,
} from "../../lib/matching";
import { blockUser } from "../../lib/blocks";
import {
  ensureDailySwipeBudget,
  incrementDailySwipes,
} from "../../lib/limits";
import MatchModal from "../components/MatchModal";
import EmptyState from "../components/EmptyState";
import { Heart, X, MapPin } from "lucide-react";

export default function SwipePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [exitX, setExitX] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<DiscoverProfile | null>(null);
  const [matchId, setMatchId] = useState("");
  const [limitMsg, setLimitMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const load = async (uid: string) => {
    const list = await fetchDiscoverProfiles(uid, 25);
    setProfiles(list);
    setCurrentIndex(0);
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded, is_paused, is_banned, photo_urls")
        .eq("id", user.id)
        .single();

      if (profile?.is_banned) {
        router.push("/auth");
        return;
      }
      if (!profile?.is_onboarded) {
        router.push("/onboarding");
        return;
      }
      if (profile?.is_paused) {
        router.push("/pause");
        return;
      }

      setUserId(user.id);
      setCurrentUserPhoto(profile?.photo_urls?.[0] || null);
      await load(user.id);
    };
    init();
  }, [router]);

  const currentProfile = profiles[currentIndex] || null;

  const advance = () => {
    setCurrentIndex((i) => i + 1);
    x.set(0);
  };

  const handleSwipe = async (action: "like" | "pass") => {
    if (!userId || !currentProfile || busy) return;
    setBusy(true);
    setLimitMsg("");

    try {
      const budget = await ensureDailySwipeBudget(userId);
      if (!budget.allowed) {
        setLimitMsg(`Daily limit reached (${budget.limit}). Come back tomorrow.`);
        setBusy(false);
        return;
      }

      await recordSwipe(userId, currentProfile.id, action);
      await incrementDailySwipes(userId);

      if (action === "like") {
        const mutual = await checkMutualLike(userId, currentProfile.id);
        if (mutual) {
          const mid = await createMatchSafe(userId, currentProfile.id);
          if (mid) {
            setMatchId(mid);
            setMatchedUser(currentProfile);
            setShowMatch(true);
          }
        }
      }

      setExitX(action === "like" ? 300 : -300);
      setTimeout(() => {
        advance();
        setExitX(0);
        setBusy(false);
      }, 180);
    } catch (err: any) {
      console.error(err);
      setLimitMsg(err?.message || "Could not save swipe");
      setBusy(false);
    }
  };

  const handleBlock = async () => {
    if (!userId || !currentProfile || busy) return;
    const ok = window.confirm(`Block ${currentProfile.first_name}?`);
    if (!ok) return;
    setBusy(true);
    try {
      await blockUser(userId, currentProfile.id);
      await recordSwipe(userId, currentProfile.id, "pass");
      advance();
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  };

  const handleReport = async () => {
    if (!userId || !currentProfile) return;
    const reason = window.prompt("Why are you reporting this profile?");
    if (!reason) return;

    await supabase.from("reports").insert({
      reporter_id: userId,
      reported_id: currentProfile.id,
      reason,
    });

    await recordSwipe(userId, currentProfile.id, "pass");
    advance();
    alert("Report submitted. Thank you.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading profiles...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Discover</h1>
          <button
            onClick={() => router.push("/filters")}
            className="text-sm text-rose-600"
          >
            Filters
          </button>
        </div>

        {limitMsg && (
          <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            {limitMsg}
          </p>
        )}

        {!currentProfile ? (
          <EmptyState
            title="No more profiles right now"
            body="Check back later, adjust filters, or review people who already liked you."
            actionLabel="See likes"
            onAction={() => router.push("/likes")}
          />
        ) : (
          <>
            <div className="relative h-[520px]">
              <AnimatePresence>
                <motion.div
                  key={currentProfile.id}
                  className="absolute inset-0 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
                  style={{ x, rotate }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 120) handleSwipe("like");
                    else if (info.offset.x < -120) handleSwipe("pass");
                    else x.set(0);
                  }}
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: exitX,
                    transition: { duration: 0.15 },
                  }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative h-72 bg-slate-200">
                    {currentProfile.photo_urls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentProfile.photo_urls[0]}
                        alt={currentProfile.first_name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No photo
                      </div>
                    )}

                    <motion.div
                      style={{ opacity: likeOpacity }}
                      className="absolute top-4 left-4 border-4 border-emerald-500 text-emerald-500 font-bold px-3 py-1 rounded-lg rotate-[-12deg] bg-white/80"
                    >
                      LIKE
                    </motion.div>
                    <motion.div
                      style={{ opacity: nopeOpacity }}
                      className="absolute top-4 right-4 border-4 border-rose-500 text-rose-500 font-bold px-3 py-1 rounded-lg rotate-[12deg] bg-white/80"
                    >
                      NOPE
                    </motion.div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-2xl font-bold">
                      {currentProfile.first_name}
                      {currentProfile.age ? `, ${currentProfile.age}` : ""}
                    </h2>
                    {currentProfile.neighborhood && (
                      <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentProfile.neighborhood}
                      </p>
                    )}
                    {currentProfile.bio && (
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {currentProfile.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-8 mt-8">
              <button
                disabled={busy}
                onClick={() => handleSwipe("pass")}
                className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
              >
                <X className="w-8 h-8 text-slate-400" />
              </button>
              <button
                disabled={busy}
                onClick={() => handleSwipe("like")}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50"
              >
                <Heart className="w-8 h-8 text-white fill-white" />
              </button>
            </div>

            <div className="flex justify-center gap-6 mt-5">
              <button
                onClick={handleBlock}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-600 hover:text-rose-600 hover:border-rose-300"
              >
                Block
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 rounded-full border border-slate-300 text-sm text-slate-600 hover:text-rose-600 hover:border-rose-300"
              >
                Report
              </button>
            </div>
          </>
        )}

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
    </div>
  );
}