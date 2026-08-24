"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function StatusPage() {
  const router = useRouter();
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [ts, setTs] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        const json = await res.json();
        setApiOk(!!json?.ok);
        setTs(json?.ts || "");
      } catch {
        setApiOk(false);
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Service status</h1>
        <p className="text-slate-500 text-sm mb-8">Windsor Connect health</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-sm">
            API:{" "}
            <span
              className={
                apiOk === null
                  ? "text-slate-500"
                  : apiOk
                  ? "text-emerald-600 font-semibold"
                  : "text-rose-600 font-semibold"
              }
            >
              {apiOk === null ? "Checking..." : apiOk ? "OK" : "Down"}
            </span>
          </p>
          {ts && <p className="text-xs text-slate-400 mt-2">{ts}</p>}
        </div>
      </div>
    </div>
  );
}