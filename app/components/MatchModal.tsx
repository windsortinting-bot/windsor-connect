"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, X } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherUser: {
    id?: string;
    first_name: string;
    photo_urls?: string[] | null;
  };
  currentUserPhoto: string | null;
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

  const otherPhoto =
    otherUser.photo_urls && otherUser.photo_urls.length > 0
      ? otherUser.photo_urls[0]
      : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <p className="text-rose-400 font-semibold tracking-wide text-sm mb-2">
            IT’S A MATCH
          </p>
          <h2 className="text-2xl font-bold text-white">
            You and {otherUser.first_name}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            You liked each other in Windsor
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-rose-500">
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

          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>

          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-rose-500">
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
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl mb-3"
        >
          <MessageCircle className="w-5 h-5" />
          Send a message
        </button>

        <button
          onClick={onClose}
          className="w-full text-slate-400 hover:text-white text-sm py-2"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
}