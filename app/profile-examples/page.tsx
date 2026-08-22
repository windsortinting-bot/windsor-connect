"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const EXAMPLES = [
  {
    title: "Strong bio",
    body: "Walkerville weekends, bad jokes, and looking for someone who actually wants to grab coffee in person.",
  },
  {
    title: "Weak bio",
    body: "Just ask. Love to laugh. No drama.",
  },
  {
    title: "Strong prompt answer",
    body: "You’ll find me at a patio in Walkerville or walking by the river after work.",
  },
  {
    title: "Weak prompt answer",
    body: "Idk haha.",
  },
];

export default function ProfileExamplesPage() {
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

        <h1 className="text-3xl font-bold mb-2">Profile examples</h1>
        <p className="text-slate-500 text-sm mb-8">
          Patterns that tend to work better
        </p>

        <div className="space-y-3">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.title}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold text-sm text-rose-600">{ex.title}</p>
              <p className="text-sm text-slate-700 mt-2">{ex.body}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/onboarding")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Edit my profile
        </button>
      </div>
    </div>
  );
}