"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you out...");

  useEffect(() => {
    const run = async () => {
      try {
        await supabase.auth.signOut();
        setMessage("Signed out.");
      } catch {
        setMessage("Signed out locally.");
      }
      setTimeout(() => router.replace("/auth"), 400);
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600 text-sm">
      {message}
    </div>
  );
}