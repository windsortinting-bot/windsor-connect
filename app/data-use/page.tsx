"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DataUsePage() {
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

        <h1 className="text-3xl font-bold mb-2">How we use data</h1>
        <p className="text-slate-500 text-sm mb-8">
          Plain-language summary for soft launch
        </p>

        <div className="space-y-3 text-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Account data</p>
            <p className="text-slate-500">
              Email and profile details run login, matching, and messaging.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Photos</p>
            <p className="text-slate-500">
              Photos you upload are shown on your profile to other members.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Safety signals</p>
            <p className="text-slate-500">
              Blocks, reports, and bans help keep the community safer.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold mb-1">Your controls</p>
            <p className="text-slate-500">
              You can export data, pause your profile, or delete your account.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push("/privacy")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Privacy policy
          </button>
          <button
            onClick={() => router.push("/settings/export")}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 rounded-xl py-3 text-sm"
          >
            Export my data
          </button>
        </div>
      </div>
    </div>
  );
}