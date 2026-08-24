"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";

export default function NoNetworkPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 text-center">
      <WifiOff className="w-10 h-10 text-slate-400 mb-4" />
      <h1 className="text-xl font-bold mb-2">Connection problem</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Check your network, then try again.
      </p>
      <button
        onClick={() => router.push("/messages")}
        className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-3 rounded-xl"
        type="button"
      >
        Retry messages
      </button>
    </div>
  );
}