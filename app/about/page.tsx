"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { APP_NAME, APP_CITY } from "../../lib/constants";

export default function AboutPage() {
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

        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
        <p className="text-rose-400 text-sm flex items-center gap-1 mb-6">
          <MapPin className="w-4 h-4" />
          Built for {APP_CITY}
        </p>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Windsor Connect is a city-first dating app for people who actually
            live in and around the 519 — Walkerville, Riverside, Downtown, South
            Windsor, and nearby neighbourhoods.
          </p>
          <p>
            Instead of endless scrolling, you get smaller daily batches, local
            profile details, and tools meant to reduce ghosting and low-effort
            chats.
          </p>
          <p>
            Soft launch means invite-only access while we grow a real local
            community carefully.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/guidelines")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Community guidelines
          </button>
          <button
            onClick={() => router.push("/safety")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Safety tips
          </button>
          <button
            onClick={() => router.push("/support")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Support
          </button>
          <button
            onClick={() => router.push("/date-ideas")}
            className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 text-sm"
          >
            Local date ideas
          </button>
        </div>
      </div>
    </div>
  );
}