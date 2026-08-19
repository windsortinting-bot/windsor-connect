"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-6">
        {error?.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={() => reset()}
        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm"
      >
        Try again
      </button>
    </div>
  );
}