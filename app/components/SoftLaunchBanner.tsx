"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SoftLaunchBanner() {
  const router = useRouter();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem("wc_hide_soft_launch");
      setHidden(v === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  if (hidden) return null;

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Soft launch in Windsor</p>
      <p className="text-amber-800/90 mt-1">
        Early access — expect rough edges. Feedback helps us improve.
      </p>
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={() => router.push("/feedback")}
          className="text-xs font-semibold text-amber-900 underline"
        >
          Send feedback
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem("wc_hide_soft_launch", "1");
            } catch {
              // ignore
            }
            setHidden(true);
          }}
          className="text-xs text-amber-800/80"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}