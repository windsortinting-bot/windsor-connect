"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState(true);
  const [messages, setMessages] = useState(true);
  const [likes, setLikes] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc_notif_settings");
      if (raw) {
        const p = JSON.parse(raw);
        setMatches(p.matches !== false);
        setMessages(p.messages !== false);
        setLikes(p.likes !== false);
      }
    } catch {
      // ignore
    }
  }, []);

  const save = () => {
    localStorage.setItem(
      "wc_notif_settings",
      JSON.stringify({ matches, messages, likes })
    );
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </button>

        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-slate-500 text-sm mb-8">
          Preferences on this device (push comes later)
        </p>

        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-3">
          <span className="text-sm">New matches</span>
          <input
            type="checkbox"
            checked={matches}
            onChange={(e) => setMatches(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-3">
          <span className="text-sm">Messages</span>
          <input
            type="checkbox"
            checked={messages}
            onChange={(e) => setMessages(e.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-6">
          <span className="text-sm">Likes</span>
          <input
            type="checkbox"
            checked={likes}
            onChange={(e) => setLikes(e.target.checked)}
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