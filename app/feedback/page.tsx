"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { trackEvent } from "../../lib/analytics";
import { ArrowLeft, Star } from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

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
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || rating < 1) {
      setStatus("error");
      setMessage("Please choose a rating");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      rating,
      body: body.trim() || null,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    await trackEvent("feedback_submitted", { rating });
    setStatus("success");
    setMessage("Thanks — feedback received.");
    setBody("");
    setRating(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">Feedback</h1>
        <p className="text-slate-500 text-sm mb-8">
          Help improve Windsor Connect during soft launch
        </p>

        {message && (
          <p
            className={`mb-4 text-sm rounded-xl px-4 py-3 border ${
              status === "success"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-rose-400 bg-rose-500/10 border-rose-500/20"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-sm text-slate-400 mb-3">Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-2"
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">
              Comments (optional)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={1000}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-500"
              placeholder="What should we improve?"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {status === "loading" ? "Sending..." : "Submit feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}