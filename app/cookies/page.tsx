"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
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

        <h1 className="text-3xl font-bold mb-2">Cookies & storage</h1>
        <p className="text-slate-500 text-sm mb-8">
          Simple explanation for soft launch
        </p>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Essential</p>
            <p className="text-slate-500">
              Login session data so you stay signed in on this device.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Local preferences</p>
            <p className="text-slate-500">
              Things like checklist progress may be saved in your browser’s
              local storage.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Analytics</p>
            <p className="text-slate-500">
              Basic product events (for example feedback submitted) help us
              improve the app during soft launch.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/privacy")}
          className="mt-8 w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
        >
          Privacy policy
        </button>
      </div>
    </div>
  );
}