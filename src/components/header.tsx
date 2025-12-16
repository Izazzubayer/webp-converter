"use client";

import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleHomeClick = () => {
    if (pathname === "/") {
      // If already on home, refresh the page
      window.location.reload();
    } else {
      // Navigate to home
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleHomeClick}
            className="font-mono font-semibold text-lg tracking-tight hover:opacity-80 transition-opacity cursor-pointer"
          >
WebP Converter
          </button>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/Izazzubayer/webp-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

