"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.toUpperCase());
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-white fill-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You’re invited</h1>
        <p className="text-slate-400 text-sm mb-6">
          Windsor Connect is invite-only during soft launch.
        </p>

        {code ? (
          <p className="mb-6 text-sm">
            Invite code:{" "}
            <span className="font-mono text-rose-400 tracking-wider">{code}</span>
          </p>
        ) : (
          <p className="mb-6 text-sm text-slate-500">
            Have a code? Enter it on the signup screen.
          </p>
        )}

        <button
          onClick={() => router.push("/auth")}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl"
        >
          Create account
        </button>
      </div>
    </div>
  );
}