"use client";

import React from "react";

export default function CheerToast({
  text,
  tone = "good",
}: {
  text: string;
  tone?: "good" | "bad";
}) {
  if (!text) return null;
  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 max-w-md mx-auto rounded-2xl px-4 py-3 text-sm shadow-lg ${
        tone === "bad"
          ? "bg-amber-100 text-amber-950 border border-amber-300"
          : "bg-rose-100 text-rose-950 border border-rose-200"
      }`}
    >
      {text}
    </div>
  );
}
