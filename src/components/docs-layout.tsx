"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface DocsLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function DocsLayout({ title, children }: DocsLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 h-8 sm:h-9"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Back
        </Button>
        
        <article className="space-y-3 sm:space-y-4">
          <h1 className="font-mono text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-foreground">{title}</h1>
          {children}
        </article>
      </div>
    </div>
  );
}
