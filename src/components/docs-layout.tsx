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
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <article className="space-y-4">
          <h1 className="font-mono text-3xl font-bold mb-6 text-foreground">{title}</h1>
          {children}
        </article>
      </div>
    </div>
  );
}
