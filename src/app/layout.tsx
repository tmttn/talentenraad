import type { Metadata } from "next";
import "./globals.css";
import Forms from "@/components/Forms/Forms";

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
    <html lang="en">
      <body className="bg-white">
        {children}
        <Forms/>
      </body>
    </html>
  );
}
