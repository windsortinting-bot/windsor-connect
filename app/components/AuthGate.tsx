"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccountState, nextRouteForAccount } from "../../lib/session";
import { pingActive } from "../../lib/heartbeat";
import { PUBLIC_PATHS, ROUTES } from "../../lib/routes";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const account = await getAccountState();
      const isPublic = PUBLIC_PATHS.has(pathname);

      if (!account && !isPublic) {
        router.replace(ROUTES.auth);
        return;
      }

      if (account) {
        pingActive(account.userId);

        if (account.isBanned && pathname !== ROUTES.banned) {
          router.replace(ROUTES.banned);
          return;
        }

        const gated = [ROUTES.swipe, ROUTES.likes, ROUTES.matches, ROUTES.messages];
        if (gated.includes(pathname as any)) {
          if (!account.isOnboarded) {
            router.replace(ROUTES.notReady);
            return;
          }
          if (account.isPaused && pathname === ROUTES.swipe) {
            router.replace(ROUTES.paused);
            return;
          }
        }
      }

      if (pathname === ROUTES.auth && account) {
        router.replace(nextRouteForAccount(account));
        return;
      }

      setReady(true);
    };

    run();
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}