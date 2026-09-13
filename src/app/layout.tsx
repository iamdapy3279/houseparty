import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atmosphere - Modular Multiplayer Party-Game Platform",
  description: "Modular multiplayer party-game platform with luxury gallery host dashboard, smartphone controller runtime, and pluggable games including Contexto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0D0D0D] text-[#e5e2e1] antialiased selection:bg-[#c9c6c5] selection:text-[#0D0D0D]`}>
        {children}
      </body>
    </html>
  );
}
