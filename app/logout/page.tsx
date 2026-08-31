"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOutNow } from "../../lib/signOutNow";

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing out...");

  useEffect(() => {
    const run = async () => {
      try {
        await signOutNow();
        setMessage("Signed out.");
      } catch {
        setMessage("Signed out on this device.");
      }
      setTimeout(() => router.replace("/auth"), 500);
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600 text-sm">
      {message}
    </div>
  );
}
