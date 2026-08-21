"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share, PlusSquare } from "lucide-react";

export default function InstallPage() {
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

        <h1 className="text-3xl font-bold mb-2">Install the app</h1>
        <p className="text-slate-500 text-sm mb-8">
          Add Windsor Connect to your phone home screen
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <Share className="w-4 h-4 text-rose-600" />
              iPhone (Safari)
            </div>
            <p className="text-slate-500">
              Tap Share → Add to Home Screen → Add.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 font-semibold mb-2">
              <PlusSquare className="w-4 h-4 text-rose-600" />
              Android (Chrome)
            </div>
            <p className="text-slate-500">
              Tap menu (⋮) → Install app / Add to Home screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}