"use client";

import React from "react";
import { timeAgo } from "../../lib/format";

export default function ActiveStamp({ iso }: { iso?: string | null }) {
  if (!iso) return null;
  return <span className="text-[11px] text-slate-400">Active {timeAgo(iso)}</span>;
}