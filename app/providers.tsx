"use client";

import React from "react";
import AuthGate from "./components/AuthGate";
import BottomNav from "./components/BottomNav";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      {children}
      <BottomNav />
    </AuthGate>
  );
}