"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ReportFab() {
  const router = useRouter();
  const path = usePathname() || "";

  if (path.startsWith("/report-bug") || path.startsWith("/support")) return null;

  return (
    <button
      type="button"
      onClick={() => router.push("/report-bug")}
      className="fixed left-3 z-40 rounded-full px-3 py-2 text-xs font-bold shadow-md"
      style={{
        bottom: "88px",
        background: "#fff4ee",
        color: "#9f1239",
        border: "2px solid #e11d48",
      }}
    >
      Report a problem
    </button>
  );
}
