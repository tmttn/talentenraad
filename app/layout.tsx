import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

export const metadata: Metadata = {
  title: "Talentenraad",
  description: "Website van de Talentenhuis Talentenraad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="overflow-auto">
      <body className="w-screen overflow-hidden antialiased bg-gradient-to-b from-white to-base-100">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
