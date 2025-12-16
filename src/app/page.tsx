"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/image-uploader";
import { ImagePreviewGrid } from "@/components/image-preview-grid";
import { ConversionSettings } from "@/components/conversion-settings";
import { Header } from "@/components/header";
import { toast } from "sonner";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  status: "pending" | "converting" | "done" | "error";
  convertedBlob?: Blob;
  convertedSize?: number;
  convertedUrl?: string;
}

export interface ConversionOptions {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  maintainAspectRatio: boolean;
}

const defaultOptions: ConversionOptions = {
  quality: 80,
  maxWidth: 1920,
  maxHeight: 1080,
  maintainAspectRatio: true,
};

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<ConversionOptions>(defaultOptions);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesAdded = useCallback((files: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"];
    
    const newImages: ImageFile[] = files
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} is not a supported image format`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        status: "pending" as const,
      }));

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? "s" : ""} added`);
    }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview);
      if (img.convertedUrl) {
        URL.revokeObjectURL(img.convertedUrl);
      }
    });
    setImages([]);
    toast.info("All images cleared");
  }, [images]);

  const updateImageStatus = useCallback(
    (id: string, updates: Partial<ImageFile>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Convert to <span className="text-primary">WebP</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fast, private image conversion. Everything happens in your browser.
              No uploads, no servers, no tracking.
            </p>
          </section>

          {/* Upload Area */}
          <ImageUploader onFilesAdded={handleFilesAdded} />

          {/* Settings & Preview */}
          {images.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
              <aside>
                <ConversionSettings
                  options={options}
                  onOptionsChange={setOptions}
                  images={images}
                  onConvert={async () => {
                    // Conversion logic will be added in Segment 4
                    setIsConverting(true);
                    toast.info("Conversion coming in next segment!");
                    setIsConverting(false);
                  }}
                  onClearAll={handleClearAll}
                  isConverting={isConverting}
                />
              </aside>
              
              <section>
                <ImagePreviewGrid
                  images={images}
                  onRemove={handleRemoveImage}
                />
              </section>
            </div>
          )}

          {/* Empty State Info */}
          {images.length === 0 && (
            <section className="text-center py-8 space-y-6">
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl mb-3">🔒</div>
                  <h3 className="font-semibold mb-2">100% Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your images never leave your device
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Client-side processing for instant results
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="text-3xl mb-3">📦</div>
                  <h3 className="font-semibold mb-2">Batch Convert</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert multiple images at once
          </p>
        </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built for web developers who need optimized images.
            <span className="mx-2">•</span>
            No data stored, ever.
          </p>
        </div>
      </footer>
    </div>
  );
}
