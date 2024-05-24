import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
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
    <html lang="nl">
      <body className="bg-white antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
