"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../lib/useAccount";
import { fetchDiscoverableProfiles } from "../../lib/discoveryQuery";
import ProfileMiniCard from "../components/ProfileMiniCard";
import AppShell from "../components/AppShell";
import PageStatus from "../components/PageStatus";

type PreviewProfile = {
  id: string;
  first_name?: string | null;
  neighborhood?: string | null;
  photo_urls?: string[] | null;
  last_active_at?: string | null;
};

export default function DiscoverPreviewPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [rows, setRows] = useState<PreviewProfile[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!account) {
        router.push("/auth");
        return;
      }
      try {
        const data = await fetchDiscoverableProfiles({
          currentUserId: account.userId,
          limit: 12,
        });
        setRows((data || []) as PreviewProfile[]);
      } catch (err: any) {
        setError(err?.message || "Could not load preview");
      }
      setReady(true);
    };
    run();
  }, [account, loading, router]);

  return (
    <AppShell title="Discover preview" onBack={() => router.push("/swipe")}>
      <p className="text-sm text-slate-600 mb-4">
        This is who the cleaner discovery helper would show next.
      </p>
      <PageStatus
        loading={!ready}
        error={error}
        empty={ready && !error && rows.length === 0 ? "No discoverable profiles right now." : undefined}
      >
        <div className="space-y-2">
          {rows.map((p) => (
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
      </PageStatus>
    </AppShell>
  );
}