"use client";

import React from "react";
import { firstPhoto } from "../../lib/images";

export default function SafeImage({
  urls,
  alt,
  className,
}: {
  urls?: string[] | null;
  alt: string;
  className?: string;
}) {
  const src = firstPhoto(urls);

  if (!src) {
    return (
      <div className={`bg-slate-200 flex items-center justify-center text-slate-400 text-xs ${className || ""}`}>
        No photo
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className || "object-cover"} />
  );
}