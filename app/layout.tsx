import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import ReportFab from "./components/ReportFab";

export const metadata: Metadata = {
  title: "Windsor Connect",
  description: "A dating site for Windsor, Ontario and nearby Ontario towns. Not Detroit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ background: "#f4c9b8", color: "#2a1810" }}>
        <Providers>{children}</Providers>
        <ReportFab />
      </body>
    </html>
  );
}
