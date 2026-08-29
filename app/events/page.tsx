"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCityEvents, type CityEvent } from "../../lib/cityEvents";
import AppShell from "../components/AppShell";

export default function EventsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CityEvent[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setRows(await loadCityEvents());
      } catch (err: any) {
        setError(err?.message || "Could not load events");
      }
    };
    run();
  }, []);

  return (
    <AppShell title="Windsor events" onBack={() => router.push("/city-map")}>
      {error && <p className="text-sm text-rose-600 mb-3">{error}</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="font-semibold">{row.title}</p>
            <p className="text-sm text-slate-500 mt-1">
              {row.place || "Windsor"} · {row.neighborhood || "Citywide"}
            </p>
            <p className="text-xs text-slate-400 mt-1">{row.event_date || "Date TBA"}</p>
          </div>
        ))}
        {rows.length === 0 && !error && (
          <p className="text-sm text-slate-500">No events posted yet.</p>
        )}
      </div>
    </AppShell>
  );
}