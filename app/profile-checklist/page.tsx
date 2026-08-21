"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";

type Item = {
  key: string;
  label: string;
  done: boolean;
  href: string;
};

export default function ProfileChecklistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "first_name, age, bio, photo_urls, neighborhood, prompt_1_answer, height, kids_status"
        )
        .eq("id", user.id)
        .single();

      const photos = Array.isArray(p?.photo_urls) ? p!.photo_urls.length : 0;

      setItems([
        {
          key: "name",
          label: "Add your first name",
          done: !!p?.first_name,
          href: "/onboarding",
        },
        {
          key: "age",
          label: "Add your age",
          done: !!p?.age,
          href: "/onboarding",
        },
        {
          key: "photos",
          label: "Add at least 2 photos",
          done: photos >= 2,
          href: "/onboarding",
        },
        {
          key: "bio",
          label: "Write a bio",
          done: !!(p?.bio && p.bio.trim().length > 10),
          href: "/onboarding",
        },
        {
          key: "area",
          label: "Choose a neighbourhood",
          done: !!p?.neighborhood,
          href: "/onboarding",
        },
        {
          key: "prompt",
          label: "Answer at least one prompt",
          done: !!(p?.prompt_1_answer && p.prompt_1_answer.trim()),
          href: "/onboarding",
        },
        {
          key: "height",
          label: "Add height (optional but helpful)",
          done: !!p?.height,
          href: "/onboarding",
        },
        {
          key: "kids",
          label: "Add kids status",
          done: !!p?.kids_status,
          href: "/onboarding",
        },
      ]);
      setLoading(false);
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Checking profile...
      </div>
    );
  }

  const complete = items.filter((i) => i.done).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>

        <h1 className="text-3xl font-bold mb-2">Profile checklist</h1>
        <p className="text-slate-500 text-sm mb-8">
          {complete}/{items.length} complete
        </p>

        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 text-left bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  item.done ? "text-slate-400 line-through" : "text-slate-800"
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}