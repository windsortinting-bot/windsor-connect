"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function QuietHoursPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("08:00");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_quiet_hours");
      if (raw) {
        const parsed = JSON.parse(raw);
        setEnabled(!!parsed.enabled);
        setStart(parsed.start || "22:00");
        setEnd(parsed.end || "08:00");
      }
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(
        "wc_quiet_hours",
        JSON.stringify({ enabled, start, end })
      );
      setMessage("Saved on this device");
    } catch {
      setMessage("Could not save");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Quiet hours</h1>
        <p className="text-slate-500 text-sm mb-8">
          Local reminder preference on this device (soft launch)
        </p>

        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-4">
          <span className="text-sm font-medium">Enable quiet hours</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 block mb-2">Start</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-2">End</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3"
            />
          </div>
        </div>

        <button
          onClick={save}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Save
        </button>

        {message && (
          <p className="mt-4 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}