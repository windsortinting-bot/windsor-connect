"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Sun, Users, Ban } from "lucide-react";

const TIPS = [
  {
    icon: Camera,
    title: "Show your face clearly",
    body: "At least one recent photo where your face is easy to see.",
  },
  {
    icon: Sun,
    title: "Use natural light",
    body: "Daylight near a window usually looks better than heavy filters.",
  },
  {
    icon: Users,
    title: "Avoid group-only photos",
    body: "People should be able to tell which person you are.",
  },
  {
    icon: Ban,
    title: "No stolen or celebrity photos",
    body: "Fake photos can get accounts removed during soft launch.",
  },
];

export default function PhotoTipsPage() {
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

        <h1 className="text-3xl font-bold mb-2">Photo tips</h1>
        <p className="text-slate-500 text-sm mb-8">
          Better photos get better matches
        </p>

        <div className="space-y-3">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{tip.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{tip.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/onboarding")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Update my photos
        </button>
      </div>
    </div>
  );
}