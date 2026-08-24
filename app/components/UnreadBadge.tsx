"use client";

import React from "react";

export default function UnreadBadge({ count }: { count: number }) {
  if (!count || count < 1) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}