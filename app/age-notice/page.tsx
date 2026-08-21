"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AgeNoticePage() {
  const router = useRouter();

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

        <h1 className="text-3xl font-bold mb-2">Age requirement</h1>
        <p className="text-slate-500 text-sm mb-8">
          Windsor Connect is for adults only
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed space-y-3">
          <p>
            You must be <span className="font-semibold">18 or older</span> to
            create an account and use this app.
          </p>
          <p>
            By signing up, you confirm that the information you provide is true
            and that you meet the minimum age requirement.
          </p>
          <p>
            Accounts that appear to belong to minors can be removed without
            notice.
          </p>
        </div>

        <button
          onClick={() => router.push("/auth")}
          className="mt-8 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-xl"
        >
          Continue to sign up
        </button>
      </div>
    </div>
  );
}