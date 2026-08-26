"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgeGatePage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  const continueOn = () => {
    try {
      localStorage.setItem("wc_age_ok", "1");
    } catch {
      // ignore
    }
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">18+ only</h1>
        <p className="text-slate-500 text-sm mb-8">
          Confirm you are an adult before using Windsor Connect.
        </p>

        <label className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl p-4 mb-6">
          <input
            type="checkbox"
            checked={ok}
            onChange={(e) => setOk(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm">I confirm I am 18 years of age or older.</span>
        </label>

        <button
          type="button"
          disabled={!ok}
          onClick={continueOn}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
        >
          Continue
        </button>
      </div>
    </div>
  );
}