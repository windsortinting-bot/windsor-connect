"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherUser: {
    id?: string;
    first_name: string;
    photo_urls?: string[] | null;
  };
  currentUserPhoto?: string | null;
}

export default function MatchModal({
  isOpen,
  onClose,
  matchId,
  otherUser,
  currentUserPhoto,
}: MatchModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const otherPhoto = otherUser.photo_urls?.[0] || null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-rose-400 font-semibold tracking-wide text-sm mb-2">
          IT’S A MATCH
        </p>
        <h2 className="text-2xl font-bold text-white mb-6">
          You and {otherUser.first_name} liked each other
        </h2>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 bg-slate-800">
            {currentUserPhoto ? (
              <img
                src={currentUserPhoto}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-600" />
              </div>
            )}
          </div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-500 bg-slate-800">
            {otherPhoto ? (
              <img
                src={otherPhoto}
                alt={otherUser.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-600" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            router.push(`/chat/${matchId}`);
          }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Send a message
        </button>
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
}