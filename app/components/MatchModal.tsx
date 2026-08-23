"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function MatchModal({
  isOpen,
  onClose,
  matchId,
  otherUser,
  currentUserPhoto,
}: {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  otherUser: {
    first_name: string;
    photo_urls?: string[] | null;
  };
  currentUserPhoto?: string | null;
}) {
  const router = useRouter();
  if (!isOpen) return null;

  const otherPhoto = otherUser.photo_urls?.[0] || null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center">
        <div className="flex justify-center -space-x-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-slate-200">
            {currentUserPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUserPhoto}
                alt="You"
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white bg-slate-200">
            {otherPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={otherPhoto}
                alt={otherUser.first_name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="flex justify-center mb-2 text-rose-500">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">It’s a match!</h2>
        <p className="text-sm text-slate-500 mb-6">
          You and {otherUser.first_name} liked each other
        </p>

        <button
          onClick={() => {
            onClose();
            router.push(`/chat/${matchId}`);
          }}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl mb-3"
        >
          Send a message
        </button>
        <button
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl"
        >
          Keep swiping
        </button>
      </div>
    </div>
  );
}