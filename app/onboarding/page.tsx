"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || "");
        setAge(data.age?.toString() || "");
        setGender(data.gender || "");
        setTargetGender(data.target_gender || "");
        setNeighborhood(data.neighborhood || "");
        setBio(data.bio || "");
        setPhotoUrl(data.photo_urls?.[0] || "");
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(fileName);

    setPhotoUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        age: parseInt(age),
        gender,
        target_gender: targetGender,
        neighborhood,
        bio,
        photo_urls: photoUrl ? [photoUrl] : [],
        is_onboarded: true,
        city: "Windsor",
      })
      .eq("id", user.id);

    setSaving(false);

    if (!error) {
      router.push("/swipe");
    } else {
      alert("Error saving profile: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Complete your profile</h1>
        <p className="text-slate-400 mb-8">This helps people in Windsor find you</p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-slate-500 text-xs">No photo</span>
                )}
              </div>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm">
                {uploading ? "Uploading..." : "Choose Photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min={18}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">I am</label>
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
            <label className="block text-sm text-slate-400 mb-1">Looking for</label>
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

          <div>
            <label className="block text-sm text-slate-400 mb-1">Neighborhood</label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="">Select</option>
              <option value="Walkerville">Walkerville</option>
              <option value="Downtown">Downtown</option>
              <option value="Ford City">Ford City</option>
              <option value="Riverside">Riverside</option>
              <option value="South Windsor">South Windsor</option>
              <option value="UWindsor">University of Windsor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A little about you..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-3 rounded-xl mt-4 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Finish & Start Swiping"}
          </button>
        </form>
      </div>
    </div>
  );
}