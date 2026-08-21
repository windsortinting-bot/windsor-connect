"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TimezonePage() {
  const router = useRouter();
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date().toLocaleString();

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

        <h1 className="text-3xl font-bold mb-2">Timezone</h1>
        <p className="text-slate-500 text-sm mb-8">
          Your device timezone used for local times
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Detected timezone</p>
            <p className="font-medium">{local}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Local time now</p>
            <p className="font-medium">{now}</p>
          </div>
          <p className="text-slate-500">
            Windsor is typically America/Toronto. If this looks wrong, check
            your phone’s date & time settings.
          </p>
        </div>
      </div>
    </div>
  );
}