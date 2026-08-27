"use client";

import React from "react";

export default function AppShell({
  title,
  onBack,
  children,
  footer,
}: {
  title?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-md mx-auto px-4 py-6 pb-28">
        {(title || onBack) && (
          <div className="flex items-center gap-3 mb-6">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-slate-500 hover:text-slate-900 text-sm"
              >
                Back
              </button>
            )}
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
          </div>
        )}
        {children}
        {footer}
      </div>
    </div>
  );
}