"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

export default function AdminFaqPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<FaqItem[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: me } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!me?.is_admin) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) setMessage(error.message);
    else setRows((data as FaqItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [router]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const { error } = await supabase.from("faq_items").insert({
      question: question.trim(),
      answer: answer.trim(),
      sort_order: rows.length + 1,
      published: true,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setQuestion("");
    setAnswer("");
    await load();
  };

  const toggle = async (row: FaqItem) => {
    const { error } = await supabase
      .from("faq_items")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Loading...
      </div>
    );
  }

  if (denied) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Admin access required.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push("/admin/links")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin menu
        </button>

        <h1 className="text-3xl font-bold mb-2">FAQ admin</h1>
        <p className="text-slate-500 text-sm mb-6">Publish help answers</p>

        {message && (
          <p className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {message}
          </p>
        )}

        <form onSubmit={add} className="space-y-3 mb-8">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            rows={4}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400"
          />
          <button
            type="submit"
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
          >
            Add FAQ
          </button>
        </form>

        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{r.question}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.published ? "Published" : "Hidden"}
                  </p>
                </div>
                <button
                  onClick={() => toggle(r)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                >
                  {r.published ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                {r.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}