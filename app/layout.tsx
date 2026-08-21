import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import TopBar from "./components/TopBar";

export const metadata: Metadata = {
  title: "Windsor Connect",
  description: "City-first dating for Windsor, ON",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Windsor Connect",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1f5f9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <TopBar />
        <main className="min-h-screen">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}