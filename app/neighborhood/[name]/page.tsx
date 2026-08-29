"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { loadDateIdeas, type DateIdea } from "../../../lib/dateIdeas";
import ProfileMiniCard from "../../components/ProfileMiniCard";
import AppShell from "../../components/AppShell";

type Mini = {
  id: string;
  first_name: string | null;
  neighborhood: string | null;
  photo_urls: string[] | null;
  last_active_at: string | null;
};

export default function NeighborhoodPage() {
  const params = useParams();
  const router = useRouter();
  const name = decodeURIComponent(String(params.name || ""));
  const [people, setPeople] = useState<Mini[]>([]);
  const [ideas, setIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const [{ data }, ideaRows] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, neighborhood, photo_urls, last_active_at, is_onboarded, is_paused, is_banned")
          .eq("neighborhood", name)
          .eq("is_onboarded", true)
          .limit(12),
        loadDateIdeas(name),
      ]);
      setPeople(
        ((data || []) as any[])
          .filter((p) => !p.is_paused && !p.is_banned)
          .map((p) => ({
            id: p.id,
            first_name: p.first_name,
            neighborhood: p.neighborhood,
            photo_urls: p.photo_urls,
            last_active_at: p.last_active_at,
          }))
      );
      setIdeas(ideaRows);
      setLoading(false);
    };
    run();
  }, [name]);

  return (
    <AppShell title={name || "Neighborhood"} onBack={() => router.push("/neighborhoods")}>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">People nearby</h2>
            <div className="space-y-2">
              {people.length === 0 && (
                <p className="text-sm text-slate-500">No public profiles in this area yet.</p>
              )}
              {people.map((p) => (
                <ProfileMiniCard
                  key={p.id}
                  name={p.first_name || "Member"}
                  neighborhood={p.neighborhood}
                  photoUrls={p.photo_urls}
                  lastActive={p.last_active_at}
                  onClick={() => router.push(`/u/${p.id}`)}
                />
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-semibold mb-2">Date ideas</h2>
            <div className="space-y-2">
              {ideas.map((idea) => (
                <div key={idea.id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
                  {idea.title}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}