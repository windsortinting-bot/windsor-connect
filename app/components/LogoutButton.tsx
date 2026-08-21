"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { LogOut } from "lucide-react";

export default function LogoutButton({
  className = "",
  label = "Log out",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // still leave local session UI
    }
    router.push("/auth");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ||
        "inline-flex items-center gap-2 text-sm text-slate-600 hover:text-rose-600 transition-colors disabled:opacity-60"
      }
    >
      <LogOut className="w-4 h-4" />
      {loading ? "Signing out..." : label}
    </button>
  );
}