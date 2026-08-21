"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const CARDS = [
  {
    title: "Be local",
    body: "This app is for people actually connected to Windsor and nearby areas.",
  },
  {
    title: "Be respectful",
    body: "Clear no’s, no harassment, and no pressure after a pass or unmatched chat.",
  },
  {
    title: "Be real",
    body: "Recent photos and honest profile details help everyone.",
  },
  {
    title: "Be safe",
    body: "Public first meets, trust your gut, and use Block/Report when needed.",
  },
];

export default function CommunityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Community values</h1>
        <p className="text-slate-500 text-sm mb-8">
          What Windsor Connect stands for
        </p>

        <div className="space-y-3">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-slate-500 mt-1">{c.body}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/guidelines")}
          className="mt-8 w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
        >
          Read full guidelines
        </button>
      </div>
    </div>
  );
}