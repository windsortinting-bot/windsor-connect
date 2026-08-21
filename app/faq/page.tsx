"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { ArrowLeft, ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const router = useRouter();
  const [rows, setRows] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("id, question, answer")
        .eq("published", true)
        .order("sort_order", { ascending: true });

      setRows((data as FaqItem[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-2">FAQ</h1>
        <p className="text-slate-500 text-sm mb-8">
          Common questions about Windsor Connect
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="space-y-2">
            {rows.map((row) => {
              const open = openId === row.id;
              return (
                <div
                  key={row.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium">{row.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-4 pb-4 text-sm text-slate-600 whitespace-pre-wrap">
                      {row.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}