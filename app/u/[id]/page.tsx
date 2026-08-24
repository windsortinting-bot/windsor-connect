"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft, MapPin } from "lucide-react";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, age, bio, neighborhood, photo_urls, gender, looking_for"
        )
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setErrorMsg("Profile not found");
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    if (id) load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 mb-6"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <p className="text-sm text-rose-700">{errorMsg || "Not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-6 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="h-72 bg-slate-200">
            {profile.photo_urls?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photo_urls[0]}
                alt={profile.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                No photo
              </div>
            )}
          </div>
          <div className="p-5">
            <h1 className="text-2xl font-bold">
              {profile.first_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h1>
            {profile.neighborhood && (
              <p className="text-sm text-rose-600 mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.neighborhood}
              </p>
            )}
            {profile.bio && (
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                {profile.bio}
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push(`/report?userId=${profile.id}`)}
              className="mt-6 w-full border border-slate-200 rounded-xl py-3 text-sm text-slate-600"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}