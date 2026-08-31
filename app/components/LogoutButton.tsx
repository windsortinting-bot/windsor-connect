"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LogoutButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/auth");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={
        className ||
        "text-sm text-slate-400 hover:text-rose-400 disabled:opacity-60"
      }
    >
      {busy ? "Signing out..." : label || "Log out"}
    </button>
  );
}