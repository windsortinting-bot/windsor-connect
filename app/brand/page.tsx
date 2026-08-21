"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";

export default function BrandPage() {
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

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Brand basics</h1>
        <p className="text-slate-500 text-sm mb-8">
          Simple identity notes for Windsor Connect
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Name</p>
            <p className="text-slate-500">Windsor Connect</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Promise</p>
            <p className="text-slate-500">
              City-first dating for people actually in and around the 519.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Tone</p>
            <p className="text-slate-500">
              Warm, direct, local, and practical — not generic dating-app hype.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Colour</p>
            <p className="text-slate-500">
              Rose accent on a light slate background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}