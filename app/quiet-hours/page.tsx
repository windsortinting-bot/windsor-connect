"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";

export default function QuietHoursPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("08:00");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("wc_quiet_hours");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setEnabled(!!parsed.enabled);
      setStart(parsed.start || "22:00");
      setEnd(parsed.end || "08:00");
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    localStorage.setItem(
      "wc_quiet_hours",
      JSON.stringify({ enabled, start, end })
    );
    setStatus("Saved on this device");
  };

  return (
    <AppShell title="Quiet hours" onBack={() => router.push("/settings")}>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Pause notification noise at night
      </label>
      <label className="block text-sm mb-3">
        Start
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2"
        />
      </label>
      <label className="block text-sm mb-4">
        End
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Save
      </button>
      {status && <p className="text-sm text-emerald-700 mt-3">{status}</p>}
    </AppShell>
  );
}