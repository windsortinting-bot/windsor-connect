"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-4">Terms</h1>
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>Windsor Connect is a local dating app in early access.</p>
          <p>You must be 18 or older to use the service.</p>
          <p>Do not harass, impersonate, or solicit money from other users.</p>
          <p>We may pause or remove accounts that break these rules.</p>
          <p>The app is provided as-is during soft launch.</p>
        </div>
      </div>
    </div>
  );
}