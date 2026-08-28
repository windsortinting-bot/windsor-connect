"use client";

import { useEffect, useState } from "react";
import { getAccountState, type AccountState } from "./session";

export function useAccount() {
  const [account, setAccount] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    const run = async () => {
      const data = await getAccountState();
      if (!live) return;
      setAccount(data);
      setLoading(false);
    };
    run();
    return () => {
      live = false;
    };
  }, []);

  return { account, loading };
}