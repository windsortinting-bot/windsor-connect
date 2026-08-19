import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "Windsor Connect",
  description: "City-first dating for Windsor, ON — local matches in the 519",
  applicationName: "Windsor Connect",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Windsor Connect",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Windsor Connect",
    description: "City-first dating for Windsor, ON",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}