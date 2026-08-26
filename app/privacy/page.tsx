"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-4">Privacy</h1>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>We store your profile, swipes, matches, and messages to run the app.</p>
          <p>You can export or request deletion from Settings.</p>
          <p>Reports may be reviewed by admins to keep the community safe.</p>
          <p>Do not share private chat screenshots publicly.</p>
        </div>
      </div>
    </div>
  );
}