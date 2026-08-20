"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { NEIGHBORHOODS } from "../../lib/constants";

const BLURBS: Record<string, string> = {
  Walkerville: "Historic streets, cafés, and easy first-date energy.",
  Downtown: "Patios, events, and nightlife close together.",
  "Ford City": "Local spots and a grounded neighbourhood feel.",
  Riverside: "River paths and quieter evening walks.",
  "South Windsor": "Residential calm and casual daytime plans.",
  "University of Windsor": "Campus-area coffee and younger local scene.",
};

export default function NeighborhoodsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Neighbourhoods</h1>
        <p className="text-slate-500 text-sm mb-8">
          Local areas Windsor Connect is built around
        </p>

        <div className="space-y-3">
          {NEIGHBORHOODS.map((n) => (
            <div
              key={n}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{n}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {BLURBS[n] || "Part of the 519 community."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}