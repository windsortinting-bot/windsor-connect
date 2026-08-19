"use client";

import React from "react";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <WifiOff className="w-14 h-14 text-slate-600 mb-4" />
      <h1 className="text-2xl font-bold mb-2">You’re offline</h1>
      <p className="text-slate-400 text-sm max-w-xs mb-6">
        Windsor Connect needs a connection to load profiles and messages.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
      >
        Try again
      </button>
    </div>
  );
}