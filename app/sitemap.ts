import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://windsor-connect-omega.vercel.app";

  const paths = [
    "",
    "/about",
    "/join",
    "/guidelines",
    "/safety",
    "/tips",
    "/date-ideas",
    "/neighborhoods",
    "/help",
    "/support",
    "/terms",
    "/privacy",
    "/accessibility",
    "/status",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}