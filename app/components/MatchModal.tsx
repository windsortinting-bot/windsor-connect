"use client";

import { Heart, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherUser: {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="relative w-full max-w-sm bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="pt-10 pb-6 text-center">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-3xl font-bold text-white">It’s a Match!</h2>
          <p className="text-slate-400 mt-2">
            You and {otherUser.first_name} liked each other
          </p>
        </div>

        <div className="flex justify-center items-center gap-4 px-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 bg-slate-800">
            {currentUserPhoto ? (
              <img
                src={currentUserPhoto}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>

          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-500 bg-slate-800">
            {otherUser.photo_urls?.[0] ? (
              <img
                src={otherUser.photo_urls[0]}
                alt={otherUser.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={() => {
              onClose();
              if (matchId && matchId !== "temp") {
                router.push(`/chat/${matchId}`);
              } else {
                router.push("/matches");
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3.5 rounded-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Send a Message
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
}