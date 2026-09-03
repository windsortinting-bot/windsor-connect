"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { AREA_OPTIONS } from "../../lib/neighborhoods";

const PROMPT_OPTIONS = [
  "A perfect Windsor weekend looks like…",
  "My simple pleasure is…",
  "I’m looking for someone who…",
  "You’ll find me at…",
  "The way to my heart is…",
  "I geek out on…",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("");
  const [targetGender, setTargetGender] = useState("everyone");
  const [neighborhood, setNeighborhood] = useState("");
  const [bio, setBio] = useState("");
  const [height, setHeight] = useState("");
  const [kidsStatus, setKidsStatus] = useState("prefer_not");
  const [kidsPreference, setKidsPreference] = useState("open");
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(55);
  const [preferredNeighborhoods, setPreferredNeighborhoods] = useState<
    string[]
  >([]);
  const [photos, setPhotos] = useState<string[]>([]);
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

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (p) {
        setFirstName(p.first_name || "");
        setAge(p.age || 25);
        setGender(p.gender || "");
        setTargetGender(p.target_gender || "everyone");
        setNeighborhood(p.neighborhood || "");
        setBio(p.bio || "");
        setHeight(p.height || "");
        setKidsStatus(p.kids_status || "prefer_not");
        setKidsPreference(p.kids_preference || "open");
        setMinAge(p.min_age_pref || 21);
        setMaxAge(p.max_age_pref || 55);
        setPreferredNeighborhoods(p.preferred_neighborhoods || []);
        setPhotos(p.photo_urls || []);
        setPrompt1(p.prompt_1 || PROMPT_OPTIONS[0]);
        setPrompt1Answer(p.prompt_1_answer || "");
        setPrompt2(p.prompt_2 || PROMPT_OPTIONS[1]);
        setPrompt2Answer(p.prompt_2_answer || "");
        setPrompt3(p.prompt_3 || PROMPT_OPTIONS[2]);
        setPrompt3Answer(p.prompt_3_answer || "");
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

  const selectAllAreas = () => setPreferredNeighborhoods([...AREA_OPTIONS]);
  const clearAreas = () => setPreferredNeighborhoods([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId || !e.target.files?.length) return;
    if (photos.length >= 3) {
      setMessage("Max 3 photos");
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setMessage("Please wait. Uploading your photo…");

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true });

    if (error) {
      setMessage(`Photo did not upload: ${error.message}`);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
    setPhotos((prev) => [...prev, data.publicUrl].slice(0, 3));
    setUploading(false);
    setMessage("Photo uploaded.");
    e.target.value = "";
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (!firstName.trim() || !gender || !neighborhood) {
      setMessage("Please fill first name, gender, and neighborhood");
      return;
    }
    if (age < 18) {
      setMessage("You must be 18+");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      first_name: firstName.trim(),
      age,
      gender,
      target_gender: targetGender,
      neighborhood,
      bio: bio.trim(),
      height: height.trim() || null,
      kids_status: kidsStatus,
      kids_preference: kidsPreference,
      min_age_pref: Math.min(minAge, maxAge),
      max_age_pref: Math.max(minAge, maxAge),
      preferred_neighborhoods: preferredNeighborhoods,
      photo_urls: photos,
      prompt_1: prompt1,
      prompt_1_answer: prompt1Answer.trim() || null,
      prompt_2: prompt2,
      prompt_2_answer: prompt2Answer.trim() || null,
      prompt_3: prompt3,
      prompt_3_answer: prompt3Answer.trim() || null,
      city: "Windsor",
      is_onboarded: true,
      last_active_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) router.back();
            else router.push("/profile");
          }}
          className="text-slate-400 hover:text-white text-sm mb-6"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-2">Complete your profile</h1>
        <p className="text-slate-500 text-sm mb-8">
          This helps people in Windsor find you
        </p>

        {message && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-slate-400 block mb-2">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div className="border border-rose-500/40 bg-rose-500/10 rounded-2xl p-4">
            <p className="text-white font-semibold mb-1">Add your photos</p>
            <p className="text-xs text-slate-300 mb-3">
              Use Choose from gallery for pictures already on your phone. Use Take photo for the camera. Wait until you see Photo uploaded.
            </p>
            <div className="flex gap-2 mb-3 flex-wrap">
              {photos.map((url) => (
                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 rounded"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            {photos.length < 3 && (
              <div className="grid grid-cols-2 gap-2">
                <label className="bg-white text-slate-900 text-center text-sm font-semibold py-3 rounded-xl cursor-pointer">
                  Choose from gallery
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <label className="bg-slate-800 border border-slate-600 text-white text-center text-sm font-semibold py-3 rounded-xl cursor-pointer">
                  Take photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            {uploading && (
              <p className="text-sm text-amber-300 mt-3">Please wait. Upload in progress…</p>
            )}
            {!uploading && photos.length > 0 && (
              <p className="text-sm text-emerald-400 mt-3">
                {photos.length} photo{photos.length > 1 ? "s" : ""} ready.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Age</label>
            <input
              type="number"
              min={18}
              max={99}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">I am</label>
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
            <label className="text-sm text-slate-400 block mb-2">Looking for</label>
            <select
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="everyone">Everyone</option>
              <option value="woman">Women</option>
              <option value="man">Men</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Min age pref</label>
              <input
                type="number"
                min={18}
                max={99}
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">Max age pref</label>
              <input
                type="number"
                min={18}
                max={99}
                value={maxAge}
                onChange={(e) => setMaxAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Neighborhood</label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="">Select</option>
              {AREA_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Preferred towns and neighborhoods (optional)
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={selectAllAreas}
                className="px-3 py-1.5 rounded-full text-sm border border-rose-500 text-rose-300"
              >
                Select all towns
              </button>
              <button
                type="button"
                onClick={clearAreas}
                className="px-3 py-1.5 rounded-full text-sm border border-slate-700 text-slate-400"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((n) => {
                const active = preferredNeighborhoods.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => togglePreferred(n)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      active
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-slate-900 border-slate-700 text-slate-300"
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Height (optional)</label>
            <input
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder='e.g. 5&apos;10"'
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Kids status</label>
            <select
              value={kidsStatus}
              onChange={(e) => setKidsStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="prefer_not">Prefer not to say</option>
              <option value="no_kids">Don’t have kids</option>
              <option value="have_kids">Have kids</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Open to kids</label>
            <select
              value={kidsPreference}
              onChange={(e) => setKidsPreference(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            >
              <option value="open">Open</option>
              <option value="want">Want kids</option>
              <option value="dont_want">Don’t want kids</option>
              <option value="already_have">Already have</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={400}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-4">
            <p className="text-sm text-slate-400">Prompts (optional)</p>
            {[
              {
                prompt: prompt1,
                setPrompt: setPrompt1,
                answer: prompt1Answer,
                setAnswer: setPrompt1Answer,
              },
              {
                prompt: prompt2,
                setPrompt: setPrompt2,
                answer: prompt2Answer,
                setAnswer: setPrompt2Answer,
              },
              {
                prompt: prompt3,
                setPrompt: setPrompt3,
                answer: prompt3Answer,
                setAnswer: setPrompt3Answer,
              },
            ].map((row, i) => (
              <div key={i} className="space-y-2">
                <select
                  value={row.prompt}
                  onChange={(e) => row.setPrompt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                >
                  {PROMPT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  value={row.answer}
                  onChange={(e) => row.setAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {saving ? "Saving..." : "Finish & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}