"use client";

import React from "react";

export default function PageStatus({
  loading,
  error,
  empty,
  children,
}: {
  loading?: boolean;
  error?: string;
  empty?: string;
  children?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        {error}
      </p>
    );
  }

  if (empty) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-500">
        {empty}
      </div>
    );
  }

  return <>{children}</>;
}