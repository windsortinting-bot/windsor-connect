"use client";

import React from "react";
import SafeImage from "./SafeImage";
import ActiveStamp from "./ActiveStamp";

export default function ProfileMiniCard({
  name,
  neighborhood,
  photoUrls,
  lastActive,
  onClick,
}: {
  name: string;
  neighborhood?: string | null;
  photoUrls?: string[] | null;
  lastActive?: string | null;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left"
    >
      <SafeImage
        urls={photoUrls}
        alt={name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="font-semibold truncate">{name}</p>
        <p className="text-xs text-slate-500 truncate">{neighborhood || "Windsor"}</p>
        <ActiveStamp iso={lastActive} />
      </div>
    </button>
  );
}