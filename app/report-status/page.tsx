"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ReportStatusPage() {
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

        <h1 className="text-3xl font-bold mb-2">After you report</h1>
        <p className="text-slate-500 text-sm mb-8">
          What happens when you flag a profile
        </p>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">1. We receive it</p>
            <p className="text-slate-500">
              Reports go into the admin queue for review.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">2. We review</p>
            <p className="text-slate-500">
              Admins can warn, pause, or ban accounts when needed.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">3. You stay in control</p>
            <p className="text-slate-500">
              You can also block the person so you don’t have to interact.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/support")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Contact support
        </button>
      </div>
    </div>
  );
}