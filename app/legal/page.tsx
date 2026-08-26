"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/resources")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Resources
        </button>
        <h1 className="text-3xl font-bold mb-6">Legal</h1>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push("/terms")}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm text-left px-4"
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => router.push("/privacy")}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm text-left px-4"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => router.push("/guidelines")}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 text-sm text-left px-4"
          >
            Community guidelines
          </button>
        </div>
      </div>
    </div>
  );
}