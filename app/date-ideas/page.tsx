"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coffee, MapPin, Music, Trees, Utensils } from "lucide-react";

const IDEAS = [
  {
    icon: Coffee,
    title: "Coffee in Walkerville",
    body: "Easy first meet. Public, low pressure, easy to end politely if there’s no spark.",
  },
  {
    icon: Trees,
    title: "Walk by the river",
    body: "Riverside path or near the waterfront. Good for conversation without a loud room.",
  },
  {
    icon: Utensils,
    title: "Casual bite on Via Italia",
    body: "Pizza, pasta, or a simple dinner. Keep it short for a first date.",
  },
  {
    icon: Music,
    title: "Downtown event or patio",
    body: "Live music, a patio, or a local market day when weather is good.",
  },
  {
    icon: MapPin,
    title: "Neighbourhood daytime plan",
    body: "Bookstore, bakery, or a short daytime hang near South Windsor or campus areas.",
  },
];

export default function DateIdeasPage() {
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

        <h1 className="text-3xl font-bold mb-2">Date ideas</h1>
        <p className="text-slate-500 text-sm mb-8">
          Simple local first-date ideas around Windsor
        </p>

        <div className="space-y-3">
          {IDEAS.map((idea) => {
            const Icon = idea.icon;
            return (
              <div
                key={idea.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{idea.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {idea.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 mt-8 text-center">
          Always meet in public first. Tell a friend where you’re going.
        </p>
      </div>
    </div>
  );
}