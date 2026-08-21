"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <WifiOff className="w-12 h-12 text-slate-400 mb-4" />
      <h1 className="text-2xl font-bold mb-2">You’re offline</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Check your connection, then try again.
      </p>
      <button
        onClick={() => router.push("/")}
        className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl"
      >
        Retry
      </button>
    </div>
  );
}