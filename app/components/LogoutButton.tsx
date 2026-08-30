"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LogoutButton({
  className,
}: {
  className?: string;
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
        "text-sm text-slate-500 hover:text-rose-600 disabled:opacity-60"
      }
    >
      {busy ? "Signing out..." : "Log out"}
    </button>
  );
}