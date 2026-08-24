"use client";

import React from "react";

export default function MessageBubble({
  body,
  mine,
  pending,
  failed,
  onRetry,
}: {
  body: string;
  mine: boolean;
  pending?: boolean;
  failed?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
          mine
            ? "bg-rose-500 text-white"
            : "bg-white border border-slate-200 text-slate-800"
        } ${pending ? "opacity-70" : ""} ${failed ? "ring-2 ring-rose-300" : ""}`}
      >
        {body}
      </div>
      {failed && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-[11px] text-rose-600 mt-1"
        >
          Failed · tap to retry
        </button>
      )}
    </div>
  );
}