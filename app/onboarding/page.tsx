"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { Heart, Upload, X } from "lucide-react";

const NEIGHBORHOODS = [
  "Walkerville",
  "Downtown",
  "Ford City",
  "Riverside",
  "South Windsor",
  "University of Windsor",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bio, setBio] = useState("");
  const [minAgePref, setMinAgePref] = useState("21");
  const [maxAgePref, setMaxAgePref] = useState("45");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setAge(profile.age ? String(profile.age) : "");
        setGender(profile.gender || "");
        setTargetGender(profile.target_gender || "");
        setNeighborhood(profile.neighborhood || "");
        setBio(profile.bio || "");
        setMinAgePref(profile.min_age_pref ? String(profile.min_age_pref) : "21");
        setMaxAgePref(profile.max_age_pref ? String(profile.max_age_pref) : "45");
        setPhotoUrls(profile.photo_urls || []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files || e.target.files.length === 0) return;
    if (photoUrls.length >= 3) {
      alert("Maximum 3 photos.");
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed. Make sure the profile-photos bucket exists and is public.");
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

    setPhotoUrls((prev) => [...prev, publicUrl]);
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!firstName || !age || !gender || !targetGender || !neighborhood) {
      alert("Please fill in all required fields.");
      return;
    }

    if (photoUrls.length === 0) {
      alert("Please add at least one photo.");
      return;
    }

    const minA = parseInt(minAgePref) || 18;
    const maxA = parseInt(maxAgePref) || 99;

    if (minA > maxA) {
      alert("Min age cannot be higher than max age.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      first_name: firstName.trim(),
      age: parseInt(age),
      gender,
      target_gender: targetGender,
      neighborhood,
      city: "Windsor",
      bio: bio.trim() || null,
      photo_urls: photoUrls,
      min_age_pref: minA,
      max_age_pref: maxA,
      is_onboarded: true,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Could not save profile. Try again.");
      return;
    }

    router.push("/swipe");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10 pb-28">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Heart className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Complete your profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            This helps people in Windsor find you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Age</label>
            <input
              type="number"
              min={18}
              max={99}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">I am</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="">Select</option>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Looking for</label>
            <select
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="">Select</option>
              <option value="man">Men</option>
              <option value="woman">Women</option>
              <option value="everyone">Everyone</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Min age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={minAgePref}
                onChange={(e) => setMinAgePref(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Max age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={maxAgePref}
                onChange={(e) => setMaxAgePref(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Neighborhood</label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="">Select</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A little about you..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              Photos (up to 3)
            </label>
            <div className="flex gap-3 flex-wrap">
              {photoUrls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-800">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ))}

              {photoUrls.length < 3 && (
                <label className="w-24 h-24 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 transition-colors">
                  {uploading ? (
                    <span className="text-xs text-slate-400">...</span>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Finish & Start Swiping"}
          </button>
        </form>
      </div>
    </div>
  );
}