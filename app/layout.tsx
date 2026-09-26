import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Windsor Connect",
  description: "Dating for Windsor, Ontario and nearby towns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ background: "#f7ebe4", color: "#2a1810" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
