"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ModerationPage() {
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

        <h1 className="text-3xl font-bold mb-2">Moderation policy</h1>
        <p className="text-slate-500 text-sm mb-8">
          How we handle reports during soft launch
        </p>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Reports</p>
            <p className="text-slate-500">
              Reports are reviewed by admins. We may hide, pause, or ban
              accounts.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Blocks</p>
            <p className="text-slate-500">
              If you block someone, you should stop seeing each other in
              discovery and chat where enforced by app rules.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Urgent harm</p>
            <p className="text-slate-500">
              If you are in immediate danger, contact local emergency services.
              Windsor Connect is not an emergency service.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/guidelines")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Community guidelines
          </button>
          <button
            onClick={() => router.push("/support")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
}