"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  place: string | null;
  planned_for: string | null;
  notes: string | null;
};

export default function DatePlanPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [plannedFor, setPlannedFor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async (uid: string) => {
    const { data, error } = await supabase
      .from("date_plans")
      .select("id, title, place, planned_for, notes")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setPlans((data as Plan[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      await load(user.id);
      setLoading(false);
    };
    init();
  }, [router]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !title.trim()) return;
    const { error } = await supabase.from("date_plans").insert({
      user_id: userId,
      title: title.trim(),
      place: place.trim() || null,
      planned_for: plannedFor ? new Date(plannedFor).toISOString() : null,
      notes: notes.trim() || null,
    });
    if (error) {
      setMessage(error.message);
      return;
    }
    setTitle("");
    setPlace("");
    setPlannedFor("");
    setNotes("");
    await load(userId);
  };

  const remove = async (id: string) => {
    if (!userId) return;
    await supabase.from("date_plans").delete().eq("id", id);
    await load(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/resources")}
          className="flex items-center gap-2 text-slate-500 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Resources
        </button>

        <h1 className="text-3xl font-bold mb-2">Date planner</h1>
        <p className="text-slate-500 text-sm mb-8">Private notes for upcoming hangouts</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={add} className="space-y-3 mb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Coffee meetup"
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3"
          />
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Place (optional)"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3"
          />
          <input
            type="datetime-local"
            value={plannedFor}
            onChange={(e) => setPlannedFor(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Save plan
          </button>
        </form>

        <div className="space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold">{p.title}</p>
              {p.place && <p className="text-sm text-slate-600 mt-1">{p.place}</p>}
              {p.planned_for && (
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(p.planned_for).toLocaleString()}
                </p>
              )}
              {p.notes && <p className="text-sm text-slate-600 mt-2">{p.notes}</p>}
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="mt-3 text-xs text-rose-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}