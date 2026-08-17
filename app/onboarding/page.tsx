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

const PROMPT_OPTIONS = [
  "A perfect Windsor Saturday looks like…",
  "My ideal first date is…",
  "I'm weirdly good at…",
  "The way to my heart is…",
  "Don't hate me if I…",
  "I geek out on…",
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
  const [preferredNeighborhoods, setPreferredNeighborhoods] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [minAgePref, setMinAgePref] = useState("21");
  const [maxAgePref, setMaxAgePref] = useState("45");
  const [height, setHeight] = useState("");
  const [kidsStatus, setKidsStatus] = useState("prefer_not");
  const [kidsPreference, setKidsPreference] = useState("open");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [prompt1, setPrompt1] = useState(PROMPT_OPTIONS[0]);
  const [prompt1Answer, setPrompt1Answer] = useState("");
  const [prompt2, setPrompt2] = useState(PROMPT_OPTIONS[1]);
  const [prompt2Answer, setPrompt2Answer] = useState("");
  const [prompt3, setPrompt3] = useState(PROMPT_OPTIONS[2]);
  const [prompt3Answer, setPrompt3Answer] = useState("");

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
        setPreferredNeighborhoods(profile.preferred_neighborhoods || []);
        setBio(profile.bio || "");
        setMinAgePref(profile.min_age_pref ? String(profile.min_age_pref) : "21");
        setMaxAgePref(profile.max_age_pref ? String(profile.max_age_pref) : "45");
        setHeight(profile.height || "");
        setKidsStatus(profile.kids_status || "prefer_not");
        setKidsPreference(profile.kids_preference || "open");
        setPhotoUrls(profile.photo_urls || []);
        setPrompt1(profile.prompt_1 || PROMPT_OPTIONS[0]);
        setPrompt1Answer(profile.prompt_1_answer || "");
        setPrompt2(profile.prompt_2 || PROMPT_OPTIONS[1]);
        setPrompt2Answer(profile.prompt_2_answer || "");
        setPrompt3(profile.prompt_3 || PROMPT_OPTIONS[2]);
        setPrompt3Answer(profile.prompt_3_answer || "");
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const togglePreferred = (n: string) => {
    setPreferredNeighborhoods((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  };

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
      alert("Upload failed. Check the profile-photos bucket is public.");
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
      preferred_neighborhoods: preferredNeighborhoods,
      city: "Windsor",
      bio: bio.trim() || null,
      photo_urls: photoUrls,
      min_age_pref: minA,
      max_age_pref: maxA,
      height: height.trim() || null,
      kids_status: kidsStatus,
      kids_preference: kidsPreference,
      prompt_1: prompt1,
      prompt_1_answer: prompt1Answer.trim() || null,
      prompt_2: prompt2,
      prompt_2_answer: prompt2Answer.trim() || null,
      prompt_3: prompt3,
      prompt_3_answer: prompt3Answer.trim() || null,
      is_onboarded: true,
      is_banned: false,
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
            <label className="text-sm text-slate-400 mb-1 block">Height</label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={`e.g. 5'10" or 178 cm`}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Do you have kids?</label>
            <select
              value={kidsStatus}
              onChange={(e) => setKidsStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="no_kids">Don't have kids</option>
              <option value="have_kids">Have kids</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Open to kids?</label>
            <select
              value={kidsPreference}
              onChange={(e) => setKidsPreference(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="want">Want kids</option>
              <option value="dont_want">Don't want kids</option>
              <option value="already_have">Already have kids</option>
              <option value="open">Open to kids</option>
            </select>
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
            <label className="text-sm text-slate-400 mb-1 block">My neighborhood</label>
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
            <label className="text-sm text-slate-400 mb-2 block">
              Neighborhoods I prefer (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {NEIGHBORHOODS.map((n) => {
                const active = preferredNeighborhoods.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => togglePreferred(n)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? "bg-rose-500/20 border-rose-500 text-rose-300"
                        : "bg-slate-900 border-slate-700 text-slate-400"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
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

          <div className="space-y-4 pt-2">
            <p className="text-sm text-slate-400 font-medium">Profile prompts (optional)</p>

            <div className="space-y-2">
              <select
                value={prompt1}
                onChange={(e) => setPrompt1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              >
                {PROMPT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={prompt1Answer}
                onChange={(e) => setPrompt1Answer(e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2">
              <select
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              >
                {PROMPT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={prompt2Answer}
                onChange={(e) => setPrompt2Answer(e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-2">
              <select
                value={prompt3}
                onChange={(e) => setPrompt3(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              >
                {PROMPT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={prompt3Answer}
                onChange={(e) => setPrompt3Answer(e.target.value)}
                placeholder="Your answer..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Photos (up to 3)</label>
            <div className="flex gap-3 flex-wrap">
              {photoUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-800"
                >
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