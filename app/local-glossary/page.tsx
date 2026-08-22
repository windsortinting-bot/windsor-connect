"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TERMS = [
  {
    term: "519",
    meaning: "The main area code and common shorthand for this region.",
  },
  {
    term: "Walkerville",
    meaning: "Historic neighbourhood known for streets, cafés, and date-friendly spots.",
  },
  {
    term: "Riverside",
    meaning: "Area near the river with paths and quieter evening walks.",
  },
  {
    term: "Via Italia",
    meaning: "Stretch known for Italian restaurants and casual dinner dates.",
  },
  {
    term: "Soft launch",
    meaning: "Invite-only early release while the community is still growing.",
  },
];

export default function LocalGlossaryPage() {
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

        <h1 className="text-3xl font-bold mb-2">Local glossary</h1>
        <p className="text-slate-500 text-sm mb-8">
          Quick terms you’ll see around Windsor Connect
        </p>

        <div className="space-y-3">
          {TERMS.map((t) => (
            <div
              key={t.term}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <p className="font-semibold text-rose-600">{t.term}</p>
              <p className="text-sm text-slate-600 mt-1">{t.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}