"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { Heart, MapPin, ArrowLeft } from "lucide-react";

export default function ViewProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      setProfile(data);
      setLoading(false);
    };

    if (profileId) load();
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <p>Profile not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-rose-400 text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const photos =
    profile.photo_urls && profile.photo_urls.length > 0
      ? profile.photo_urls
      : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="relative w-full h-80 bg-slate-800">
            {photos.length > 0 ? (
              <img
                src={photos[photoIndex]}
                alt={profile.first_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-slate-600" />
              </div>
            )}

            {photos.length > 1 && (
              <>
                <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {photos.map((_: string, i: number) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${
                        i === photoIndex ? "w-6 bg-white" : "w-4 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                  onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                  onClick={() =>
                    setPhotoIndex((p) => Math.min(photos.length - 1, p + 1))
                  }
                />
              </>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold">
              {profile.first_name}
              {profile.age ? `, ${profile.age}` : ""}
            </h1>

            <div className="flex items-center gap-1 text-rose-400 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              {profile.neighborhood || profile.city || "Windsor"}
            </div>

            {profile.gender && (
              <p className="text-slate-400 text-sm mt-3 capitalize">
                {profile.gender}
              </p>
            )}

            {profile.bio && (
              <p className="text-slate-300 mt-4 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}