"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PREFETCH_ROUTES } from "../../lib/prefetch";

export default function PrefetchCore() {
  const router = useRouter();

  useEffect(() => {
    PREFETCH_ROUTES.forEach((path) => {
      try {
        router.prefetch(path);
      } catch {
        // ignore
      }
    });
  }, [router]);

  return null;
}