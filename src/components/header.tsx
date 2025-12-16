"use client";

import { ImageIcon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            Image Converter
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com"
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

