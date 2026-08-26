"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const AREAS = [
  { name: "Walkerville", blurb: "Cafes, patios, easy first-date energy." },
  { name: "Downtown", blurb: "Shows, walks along the river, late bites." },
  { name: "Riverside", blurb: "Quieter meetups and waterfront walks." },
  { name: "Ford City", blurb: "Local spots and neighborhood hangouts." },
  { name: "South Windsor", blurb: "Casual coffee and easier parking." },
  { name: "University of Windsor", blurb: "Campus-adjacent study dates and coffee." },
];

export default function NeighborhoodsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/resources")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Resources
        </button>
        <h1 className="text-3xl font-bold mb-2">Windsor areas</h1>
        <p className="text-slate-500 text-sm mb-8">Use these in bios and first messages</p>
        <div className="space-y-3">
          {AREAS.map((a) => (
            <div key={a.name} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-slate-600 mt-1">{a.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}