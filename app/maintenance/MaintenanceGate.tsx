"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getFlag } from "../../lib/flags";

const ALLOW = ["/maintenance", "/auth", "/terms", "/privacy", "/support", "/"];

export default function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const enabled = await getFlag("maintenance_mode", false);
      if (!enabled) {
        setReady(true);
        return;
      }

      if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        setReady(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: me } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        if (me?.is_admin) {
          setReady(true);
          return;
        }
      }

      router.replace("/maintenance");
    };

    run();
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 text-sm">
        Checking status...
      </div>
    );
  }

  return <>{children}</>;
}