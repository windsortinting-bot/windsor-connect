"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAdmin } from "../../../lib/adminUsers";
import { supabase } from "../../../lib/supabaseClient";
import AppShell from "../../components/AppShell";

export default function AdminEventsPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [neighborhood, setNeighborhood] = useState("Downtown");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        await requireAdmin();
      } catch {
        setDenied(true);
      }
    };
    run();
  }, []);

  const save = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("city_events").insert({
      title: title.trim(),
      place: place.trim() || null,
      neighborhood,
      event_date: new Date().toISOString().slice(0, 10),
      is_active: true,
    });
    setStatus(error ? error.message : "Event added");
    if (!error) {
      setTitle("");
      setPlace("");
    }
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <AppShell title="Add city event" onBack={() => router.push("/admin/launch")}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 mb-3"
      />
      <input
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Place"
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 mb-3"
      />
      <input
        value={neighborhood}
        onChange={(e) => setNeighborhood(e.target.value)}
        placeholder="Neighborhood"
        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 mb-3"
      />
      <button
        type="button"
        onClick={save}
        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
      >
        Save event
      </button>
      {status && <p className="text-sm mt-3">{status}</p>}
    </AppShell>
  );
}