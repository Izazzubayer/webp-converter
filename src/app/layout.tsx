import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AI Image Converter | WebP, AVIF, PNG, JPEG",
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
  icons: {
    icon: "/ri_brush-ai-fill.png",
    apple: "/ri_brush-ai-fill.png",
  },
  openGraph: {
    title: "AI Image Converter | WebP, AVIF, PNG, JPEG",
    description:
      "High-quality image conversion powered by Sharp. Convert to WebP, AVIF, PNG, JPEG with quality control and resizing. Fast and efficient.",
    images: [
      {
        url: "/ri_brush-ai-fill.png",
        width: 1200,
        height: 630,
        alt: "AI Image Converter Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Converter | WebP, AVIF, PNG, JPEG",
    description:
      "High-quality image conversion powered by Sharp. Convert to WebP, AVIF, PNG, JPEG with quality control and resizing. Fast and efficient.",
    images: ["/ri_brush-ai-fill.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
