"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const TEXT = `Windsor Connect is a dating site for Windsor, LaSalle, Tecumseh, Amherstburg and nearby.

Create an account here:
https://windsor-connect-omega.vercel.app/auth

Invite code: WINDSOR519

Add a photo, pick your town, and swipe. If something breaks, tell me.`;

export default function InviteTextPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TEXT);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 px-4 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.push("/go-live")}
          className="flex items-center gap-2 text-slate-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Go live
        </button>
        <h1 className="text-3xl font-bold mb-2">Invite text</h1>
        <p className="text-sm text-slate-500 mb-4">
          Send this to 5 people who actually live here. Change the code if you made a new one.
        </p>
        <pre className="whitespace-pre-wrap bg-white border border-slate-200 rounded-2xl p-4 text-sm mb-4">
          {TEXT}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl"
        >
          {copied ? "Copied" : "Copy text"}
        </button>
      </div>
    </div>
  );
}
