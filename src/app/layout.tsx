import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Converter | WebP, AVIF, PNG, JPEG",
  description:
    "High-quality image conversion powered by Sharp. Convert to WebP, AVIF, PNG, JPEG with quality control and resizing. Fast and efficient.",
  keywords: [
    "image converter",
    "webp converter",
    "avif converter",
    "image optimization",
    "compress images",
    "sharp",
    "libvips",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
