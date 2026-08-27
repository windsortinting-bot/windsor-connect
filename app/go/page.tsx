"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccountState, nextRouteForAccount } from "../../lib/session";

export default function GoPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const account = await getAccountState();
      router.replace(nextRouteForAccount(account));
    };
    run();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
      Taking you to the right place...
    </div>
  );
}