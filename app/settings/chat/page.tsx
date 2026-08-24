"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ChatSettingsPage() {
  const router = useRouter();
  const [enterToSend, setEnterToSend] = useState(true);
  const [showTyping, setShowTyping] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_chat_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setEnterToSend(parsed.enterToSend !== false);
        setShowTyping(parsed.showTyping !== false);
      }
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem(
        "wc_chat_settings",
        JSON.stringify({ enterToSend, showTyping })
      );
      setSaved(true);
    } catch {
      // ignore
    }
  };

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

        <h1 className="text-3xl font-bold mb-2">Chat settings</h1>
        <p className="text-slate-500 text-sm mb-8">Saved on this device</p>

        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-3">
          <span className="text-sm">Enter to send</span>
          <input
            type="checkbox"
            checked={enterToSend}
            onChange={(e) => setEnterToSend(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6">
          <span className="text-sm">Show typing indicator</span>
          <input
            type="checkbox"
            checked={showTyping}
            onChange={(e) => setShowTyping(e.target.checked)}
          />
        </label>

        <button
          onClick={save}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          type="button"
        >
          Save
        </button>

        {saved && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Saved
          </p>
        )}
      </div>
    </div>
  );
}