"use client";

import React from "react";

export default function OnlineDot({ online }: { online?: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        online ? "bg-emerald-500" : "bg-slate-300"
      }`}
      title={online ? "Online" : "Offline"}
    />
  );
}