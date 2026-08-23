"use client";

import React from "react";

export default function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-2">{body}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}