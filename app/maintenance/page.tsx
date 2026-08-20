"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { APP_NAME } from "../../lib/constants";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <Wrench className="w-12 h-12 text-amber-400 mb-4" />
      <h1 className="text-2xl font-bold mb-2">{APP_NAME} is updating</h1>
      <p className="text-slate-400 text-sm max-w-sm">
        We’re doing a short maintenance window. Please check back soon.
      </p>
    </div>
  );
}