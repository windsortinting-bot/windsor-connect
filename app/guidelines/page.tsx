"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function GuidelinesPage() {
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

        <h1 className="text-3xl font-bold mb-2">Community guidelines</h1>
        <p className="text-slate-500 text-sm mb-8">
          Keep Windsor Connect respectful and local
        </p>

        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-white mb-2">Be real</h2>
            <p>
              Use recent photos of yourself. No catfishing, no stolen images, no
              fake profiles.
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-white mb-2">Be respectful</h2>
            <p>
              No harassment, hate speech, threats, or pressure. If someone isn’t
              interested, move on.
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-white mb-2">Be safe</h2>
            <p>
              Meet in public first. Never send money, gift cards, or personal
              financial info. Report scams immediately.
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-white mb-2">Keep it local</h2>
            <p>
              This app is built for Windsor and nearby 519 areas. Spam, promo
              accounts, and off-platform solicitation can be removed.
            </p>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h2 className="font-semibold text-white mb-2">Enforcement</h2>
            <p>
              We may warn, pause, or ban accounts that break these rules. Serious
              issues may be reported to authorities when required.
            </p>
          </section>
        </div>

        <div className="mt-8 space-y-3">
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
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
}