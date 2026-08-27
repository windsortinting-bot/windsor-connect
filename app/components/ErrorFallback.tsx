"use client";

import React from "react";

export default function ErrorFallback({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Something broke</h1>
        <p className="text-sm text-slate-600 mb-6">
          {message || "Reload and try that page again."}
        </p>
        <button
          type="button"
          onClick={onRetry || (() => window.location.reload())}
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-3 rounded-xl"
        >
          Reload
        </button>
      </div>
    </div>
  );
}