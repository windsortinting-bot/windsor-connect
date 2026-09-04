"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Coffee, Sparkles, Beer, Utensils } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-white">Windsor Connect</span>
          </div>
          <button
            onClick={() => router.push("/auth")}
            className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 text-center">
          <p className="text-rose-400 text-sm font-medium mb-3 flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            Windsor, LaSalle, Tecumseh, Amherstburg & nearby
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Real connections across
            <br />
            Windsor and surrounding area
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            A dating site for people in Windsor and the nearby towns. If you have
            an invite code, create an account. If you already have one, sign in.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <button
              onClick={() => router.push("/auth")}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Create an account
            </button>
            <button
              onClick={() => router.push("/help")}
              className="bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl"
            >
              How it works
            </button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Local first</h3>
              <p className="text-sm text-slate-400">
                Windsor plus LaSalle, Amherstburg, Tecumseh, St. Clair Beach,
                Harrow, Colchester, Essex, Kingsville, and Belle River.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Meet nearby</h3>
              <p className="text-sm text-slate-400">
                Short drives. Public first dates. No 90-minute mystery trips.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Beer className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2">Safer chat</h3>
              <p className="text-sm text-slate-400">
                Match tools, block/report, and simple safety tips.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white">Windsor-area first dates</h3>
            <p className="text-sm text-slate-400 mt-2">
              Coffee in Walkerville, a patio in Tecumseh, or a walk by the river.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Windsor Connect. Built for the Windsor area.
      </footer>
    </div>
  );
}
