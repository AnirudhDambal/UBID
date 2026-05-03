import type { Metadata } from "next";
<<<<<<< HEAD
import { Inter } from "next/font/google";
=======
import { Space_Grotesk, Space_Mono } from "next/font/google";
>>>>>>> origin/main
import "./globals.css";
import { Providers } from "@/components/providers";

<<<<<<< HEAD
const inter = Inter({
  variable: "--font-inter",
=======
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
>>>>>>> origin/main
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "UBID Portal",
  description: "Government Portal for UBID",
=======
  title: "UBID Platform",
  description: "Universal Business Identifier Platform - Entity Resolution & Deduplication",
>>>>>>> origin/main
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
=======
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
>>>>>>> origin/main
    </html>
  );
}
